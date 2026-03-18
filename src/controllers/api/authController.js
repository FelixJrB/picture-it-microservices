import jwt from 'jsonwebtoken'
import { PRIVATE_KEY } from '../../utils/jwt.js'
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
     * @param {object} req - Express request object, body should contain firstName, lastName, email, username and password
     * @param {object} res - Express response object
     * @param {object} next - Express next middleware function
     * @returns {Promise<void>} 201 with { id } on success, 400 if fields are missing
     */
    async register(req, res, next) {
        try {
            const { firstName, lastName, email, username, password } = req.body

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
                email
            })
            res.status(201).json({ id: user.id }) // Created (201) PUT/POST succesfully created a new resource on the server.
        } catch (error) {
            next(error)
        }
    }

    /**
     * Logs in a user and returns a JWT token.
     * @param {object} req - Express request object
     * @param {object} res - Express response object
     * @param {object} next - Express next middleware function
     */
    async login(req, res, next) {
        try {
            const { username, password } = req.body

            const user = await UserModel.authenticate(username, password)
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' })
            }

            const token = jwt.sign({
                sub: user.id,
                username: user.username,
            },
                PRIVATE_KEY,
                {
                    algorithm: 'RS256',
                    expiresIn: '1h'
                })

            res.json({ 'access-token': token })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}