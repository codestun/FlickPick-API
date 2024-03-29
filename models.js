const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Mongoose schema for movies.
 * @typedef {Object} movieSchema
 * @property {string} Title - The title of the movie.
 * @property {string} Description - The description of the movie.
 * @property {Object} Genre - The genre of the movie.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - The description of the genre.
 * @property {Object} Director - The director of the movie.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Bio - The biography of the director.
 * @property {string[]} Actors - List of actors in the movie.
 * @property {string} ImagePath - Path to the movie's image.
 * @property {boolean} Featured - Flag to indicate if the movie is featured.
 */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

/**
 * Mongoose schema for users.
 * @typedef {Object} userSchema
 * @property {string} Name - The name of the user.
 * @property {string} Password - The user's password.
 * @property {string} Email - The user's email address.
 * @property {Date} Birthday - The user's birthday.
 * @property {Array.<ObjectId>} FavoriteMovies - List of favorite movies (referencing Movie model).
 */
let userSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {string} The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Validates a password against the user's stored password.
 * @param {string} password - The password to validate.
 * @returns {boolean} True if the password matches, false otherwise.
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

/**
 * Movie model, created using the movieSchema.
 */
let Movie = mongoose.model('Movie', movieSchema);

/**
 * User model, created using the userSchema.
 */
let User = mongoose.model('User', userSchema);

// Export the Movie and User models
module.exports.Movie = Movie;
module.exports.User = User;
