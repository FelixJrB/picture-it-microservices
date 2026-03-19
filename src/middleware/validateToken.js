import jwt from 'jsonwebtoken'
import { PUBLIC_KEY } from '../utils/jwt.js'
import { UserModel } from '../models/User.js'

export async function authenticateJWT(req, res, next) {

    try {
        const token = req.headers.authorization?.split(' ')[1]
        const payload = jwt.verify(token, PUBLIC_KEY)
        const user = await UserModel.findById(payload.sub)

        if (!user) {
            return res.status(401).json({ error: "User no longer exists." })
        }

        req.user = user
        next()
    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: "Invalid or expired token." })
    }
}