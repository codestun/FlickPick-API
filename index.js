/**
 * @fileoverview Module imports and initial setup for the movie-api application.
 * This file sets up the express application, configures middleware, establishes database connections,
 * and defines routes for handling HTTP requests.
 */

// Load necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
require("dotenv").config();

/**
 * @description Set up express and body-parser.
 * This section configures the express application and sets up middleware
 * for parsing JSON and URL-encoded data.
 */
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * @description CORS setup to allow cross-origin requests.
 * Specifies which domains are allowed to access the API.
 */
const cors = require('cors');
let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:4200',
  'https://flickpick-1911bf3985c5.herokuapp.com',
  'http://localhost:1234',
  'https://myflickpick.netlify.app',
  'https://codestun.github.io'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

/**
 * @description Import and setup authentication module.
 * Integrates Passport for user authentication within the application.
 */
let auth = require('./auth')(app);

// Require the Passport module and import the "passport.js" file
const passport = require('passport');
require('./passport');

/**
 * @description Morgan logging setup.
 * Integrates Morgan for logging HTTP request data for debugging and monitoring.
 */
app.use(morgan('combined'));

/**
 * @description Connects to the MongoDB database using Mongoose.
 * The connection URI is retrieved from environment variables.
 */
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to the MongoDB database using the local connection URI
// mongoose.connect('mongodb://localhost:27017/fpDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

const Movies = Models.Movie;
const Users = Models.User;

/* ------ Routes for Movies -------- */

/**
 * @route GET /movies
 * @description Returns a JSON object containing data about all movies.
 * @access Private
 * @returns {Object[]} movies - List of all movies.
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * @route GET /movies/:Title
 * @description Returns data about a single movie by title.
 * @access Private
 * @param {string} Title - Title of the movie.
 * @returns {Object} movie - Data about the movie.
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @route GET /genres/:Name
 * @description Returns data about a specific genre by name.
 * @access Private
 * @param {string} Name - Name of the genre.
 * @returns {Object} genre - Description of the genre.
 */
app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Name })
    .then((movie) => {
      if (movie) {
        res.json(movie.Genre);
      } else {
        res.status(404).send('Genre ' + req.params.Name + ' not found.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @route GET /directors/:Name
 * @description Returns data about a director by name.
 * @access Private
 * @param {string} Name - Name of the director.
 * @returns {Object} director - Data about the director.
 */
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Name })
    .then((movie) => {
      if (movie) {
        res.json(movie.Director);
      } else {
        res.status(404).send('Director ' + req.params.Name + ' not found.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/* ------ Routes for Users -------- */

/**
 * @route GET /users
 * @description Returns a list of all users.
 * @access Private
 * @returns {Object[]} users - List of all users.
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @route GET /users/:Name
 * @description Returns data about a single user by name.
 * @access Private
 * @param {string} Name - Name of the user.
 * @returns {Object} user - Data about the user.
 */
app.get('/users/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Name: req.params.Name })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @route POST /users
 * @description Allows new users to register.
 * @access Public
 * @param {string} Name - User's name.
 * @param {string} Email - User's email.
 * @param {string} Password - User's password.
 * @param {Date} Birthday - User's birthday.
 * @returns {Object} user - The registered user object.
 */
app.post('/users', [
  check('Name', 'Name is required').notEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail(),
  check('Password', 'Password is required').notEmpty(),
  check('Birthday', 'Birthday is required').notEmpty().toDate()
], (req, res) => {
  // Check for validation errors
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  // Password in the req.body gets hashed
  let hashedPassword = Users.hashPassword(req.body.Password);

  // Search for an existing user with the requested name
  Users.findOne({ Name: req.body.Name })
    .then((user) => {
      if (user) {
        // If the user is found, send a response that it already exists
        return res.status(400).send(req.body.Name + ' already exists');
      } else {
        // If no user was found, the code proceeds to create a new user using the hashed password
        Users.create({
          Name: req.body.Name,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


/**
 * @route PUT /users/:Name
 * @description Allows users to update their information.
 * @access Private
 * @param {string} Name - User's updated name.
 * @param {string} Email - User's updated email.
 * @param {string} Password - User's updated password.
 * @param {Date} Birthday - User's updated birthday.
 * @returns {Object} updatedUser - The updated user object.
 */
app.put('/users/:Name', [
  check('Name', 'Name is required').notEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail(),
  check('Password', 'Password is required').notEmpty(),
  check('Birthday', 'Birthday is required').notEmpty().toDate()
], (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate(
    { Name: req.params.Name },
    {
      $set:
      {
        Name: req.body.Name,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true })
    .then(updatedUser => {
      if (!updatedUser) {
        return res.status(404).send('User not found');
      }
      res.json(updatedUser);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @route POST /users/:Name/movies/:MovieID
 * @description Allows users to add a movie to their list of favorites.
 * @access Private
 * @param {string} Name - User's name.
 * @param {string} MovieID - ID of the movie to add to favorites.
 * @returns {Object} updatedUser - The user object with updated favorites list.
 */
app.post('/users/:Name/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Name },
    { $push: { FavoriteMovies: req.params.MovieID } },
    { new: true })
    .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @route DELETE /users/:Name/movies/:MovieID
 * @description Allows users to remove a movie from their list of favorites.
 * @access Private
 * @param {string} Name - User's name.
 * @param {string} MovieID - ID of the movie to remove from favorites.
 * @returns {Object} updatedUser - The user object with updated favorites list.
 */
app.delete('/users/:Name/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Name },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true }) // This line makes sure that the updated document is returned
    .then(updatedUser => {
      res.json(updatedUser);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * @route DELETE /users/:Name
 * @description Allows existing users to deregister.
 * @access Private
 * @param {string} Name - Name of the user to deregister.
 * @returns {string} message - Confirmation message of user deletion.
 */
app.delete('/users/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Name: req.params.Name })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Name + ' was not found');
      } else {
        res.status(200).send(req.params.Name + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/* ------ Other Routes -------- */
/**
 * @route GET /
 * @description Default route to welcome users.
 * @access Public
 * @returns {string} message - Welcome message.
 */
app.get('/', (req, res) => {
  res.send('Welcome to FlickPick!');
});

/**
 * @route GET /documentation
 * @description Serves the API documentation file.
 * @access Public
 * @returns {file} - Sends the documentation HTML file.
 */
app.get('/documentation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'documentation.html'));
});

/**
 * @description Error handling middleware.
 * Handles any errors that occur in the routing and request handling process.
 */

app.use((err, req, res, next) => {
  // Log error to the terminal
  console.error(err);

  // Send an error response to the client
  res.status(500).send('Internal Server Error');
});

/**
 * @description Initializes and starts the server on a specified port.
 * The port number is obtained from environment variables or defaults to 8080.
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
