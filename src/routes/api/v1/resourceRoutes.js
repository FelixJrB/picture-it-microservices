import express from 'express';
import { resourceController } from '../../../controllers/api/resourceController.js';

export const router = express.Router()

const controller = new resourceController()

router.param('id', (req, res, next, id) =>
    controller.loadResource(req, res, next, id))

// fem router för en crud applikation, get all, get one, create, update och delete
router.get('/', (req, res, next) => controller.findAll(req, res, next))

router.get('/:id', (req, res, next) => controller.find(req, res, next))

router.post('/', (req, res, next) => controller.create(req, res, next))


router.put('/:id', (req, res, next) => controller.update(req, res, next))

router.delete('/:id', (req, res, next) => controller.delete(req, res, next))