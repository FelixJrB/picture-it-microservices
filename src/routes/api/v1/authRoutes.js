import express from 'express'
import { authController } from '../../../controllers/api/authController.js'

export const router = express.Router()

const controller = new authController()

// Routes for user registration and login
router.post('/register', (req, res, next) => controller.register(req, res, next))
router.post('/login', (req, res, next) => controller.login(req, res, next))