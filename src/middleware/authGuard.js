
import jwt from 'jsonwebtoken'
import { PUBLIC_KEY } from '../utils/jwt.js';

export async function authenticateJWT(req, res, next) {

    try {

        const authorization = req.headers.authorization;



        if (!authorization?.startsWith("Bearer ")) {

            return res.status(401).json({ error: "Missing bearer token." })

        }

        const token = authorization.split(" ")[1];

        const payload = jwt.verify(token, PUBLIC_KEY, {

            algorithm: ["RS256"],
            issuer: 'Felix Berglund'

        })
        req.user = payload
        next()

    } catch (error) {

        console.log(error)

        return res.status(401).json({ error: "Invalid or expired token." })

    }

}