// This has to be the same key used in the JWTStrategy
const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport'); // Your local passport file

/**
 * Generates a JWT token for a user.
 * @param {Object} user - The user object for whom the token is being generated.
 * @returns {string} JWT token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Name, // The username encoded in the JWT
    expiresIn: '7d', // Token expiration time
    algorithm: 'HS256' // Algorithm used to encode the JWT
  });
};

/* POST login route */
module.exports = (router) => {
  /**
 * @route POST /login
 * @description Authenticates a user and returns a JWT token upon successful authentication.
 * @param {Object} req - The request object containing user credentials.
 * @param {Object} res - The response object.
 */
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
