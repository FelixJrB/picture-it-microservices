import jwt from 'jsonwebtoken'
import { PRIVATE_KEY } from '../../utils/jwt.js'
import { PUBLIC_KEY } from '../../utils/jwt.js'
import { UserModel } from '../../models/User.js'

/**
 * Controller for handling user authentication, including registration and login.
 * Each method corresponds to a specific operation:
 * - register: Handles user registration by creating a new user in the database
 * - login: Authenticates a user and generates a JWT token for valid credentials
 */
export class authController {

  /**
   * Registers a new user account.
   *
   * @param {object} req - Express request object, body should contain firstName, lastName, email, username and password
   * @param {object} res - Express response object
   * @param {object} next - Express next middleware function
   * @returns {Promise<void>} 201 with { id } on success, 400 if fields are missing
   */
  async register(req, res, next) {
    try {
      const { email, firstName, lastName, password, username } = req.body

      if (!firstName || !lastName || !email || !username || !password) {
        return res
          .status(400) // Bad Request
          .json({ error: 'All fields are required' })
      }

      const user = await UserModel.create({
        username,
        passwordHash: password,
        firstName,
        lastName,
        email,
      })
      return res.status(201).json({ id: user.id }) // Created (201) PUT/POST succesfully created a new resource on the server.
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Logs in a user and returns a JWT token.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {object} next - Express next middleware function
   * @returns {Promise<void>} 200 with { access-token } on success, 401 if credentials are invalid
   */
  async login(req, res, next) {
    try {
      const { password, username } = req.body

      const user = await UserModel.authenticate(username, password)
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' })
      }

      // Generate JWT token with user information and return it in the response 
      const Accesstoken = jwt.sign({
        sub: user.id,
        username: user.username, 
      },
      PRIVATE_KEY,
      {
        algorithm: 'RS256',
        expiresIn: '10min', 
        issuer: 'Felix Berglund', 
      })

      // Generate a refresh token with a longer expiration time on succesful login.
      const Refreshtoken = jwt.sign({
        sub: user.id,
        username: user.username, 
        Refreshtoken: true,
      },
      PRIVATE_KEY,
      {
        algorithm: 'RS256',
        expiresIn: '1d', 
        issuer: 'Felix Berglund', 
      })

      return res.json({ 'access-token': Accesstoken , 'refresh-token': Refreshtoken })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }

  /**
   * Refreshes the access token using the refresh token.
   *
   * @param {object} req - Express request object, body should contain firstName, lastName, email, username and password
   * @param {object} res - Express response object
   * @param {object} next - Express next middleware function
   * @returns {Promise<void>} 200 with { refresh-token } on success, 401 if credentials are invalid
   */
  async refreshToken(req, res, next) {
    try {
    
      const refreshAccessToken = jwt.verify(req.body['refresh-token'], PUBLIC_KEY)
    
      // Generate JWT token with user information and return it in the response 
      const Accesstoken = jwt.sign({
        sub: refreshAccessToken.sub,
        username: refreshAccessToken.username, 
      },
      PRIVATE_KEY,
      {
        algorithm: 'RS256',
        expiresIn: '10min', 
        issuer: 'Felix Berglund', 
      })
      return res.json({'access-token': Accesstoken })
    } catch (err) {
      console.log(err)
      return next(err)
    }
  }
}