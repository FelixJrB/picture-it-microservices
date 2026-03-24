import express from 'express'
import { resourceController } from '../../../controllers/api/resourceController.js'
import { authenticateJWT } from '../../../middleware/authGuard.js'


export const router = express.Router()

const controller = new resourceController()

router.param('id', (req, res, next, id) =>
    controller.loadResource(req, res, next, id))

// Apply the JWT authentication middleware to all routes in this router
router.use(authenticateJWT)

// Six routes for a crud application
// get all, get one, create, update, partial update and delete
router.get('/', (req, res, next) => controller.findAll(req, res, next))

router.get('/:id', (req, res, next) => controller.find(req, res, next))

router.post('/', (req, res, next) => controller.create(req, res, next))

router.put('/:id', (req, res, next) => controller.update(req, res, next))

router.patch('/:id', (req, res, next) => controller.partialUpdate(req, res, next))

router.delete('/:id', (req, res, next) => controller.delete(req, res, next))