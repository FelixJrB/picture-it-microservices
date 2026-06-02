import jwt from 'jsonwebtoken'
import { PUBLIC_KEY } from '../utils/jwt.js'
import { UserModel } from '../models/User.js'

/**
 * Middleware function to authenticate requests using JWT.
 *
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Resolves if the token is valid and the user is authenticated, or sends a 401 response if not.
 */
export async function authenticateJWT(req, res, next) {

  try {
    const token = req.headers.authorization?.split(' ')[1]
    const payload = jwt.verify(token, PUBLIC_KEY)
    const user = await UserModel.findById(payload.sub)

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' })
    }

    req.user = user
    return next()
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}