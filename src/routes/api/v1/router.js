
import express from 'express'
import { router as authRouter } from './authRoutes.js'
export const router = express.Router()

router.use('/', authRouter)