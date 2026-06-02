
import jwt from 'jsonwebtoken'
import { PUBLIC_KEY } from '../utils/jwt.js'

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

    const authorization = req.headers.authorization



    if (!authorization?.startsWith('Bearer ')) {

      return res.status(401).json({ error: 'Missing bearer token.' })

    }

    const token = authorization.split(' ')[1]

    const payload = jwt.verify(token, PUBLIC_KEY, {

      algorithm: ['RS256'],
      issuer: 'Felix Berglund',

    })
    req.user = payload
    return next()

  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: 'Invalid or expired token.' })

  }

}