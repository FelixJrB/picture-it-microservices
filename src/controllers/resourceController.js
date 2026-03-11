import { Resource } from '../models/Resource.js';


export class resourceController {
    async loadResource(req, res, next, id) {
        try {
            const resource = await Resource.findById(id);
            if (!resource) {
                const error = new Error('Resource not found');
                error.status = 404;
                throw error;
            }

            req.resource = resource;
            next();
        } catch (error) {
            next(error);
        }
    }


    async findAll(req, res, next) {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.json(resources);
    }

    async find(req, res, next) {
        res.json(req.resource);
    }


    async create(req, res, next) {
        const { title, description, imageUrl } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const resource = await Resource.create({ title, description, imageUrl });
        res.status(201).json(resource);
    }

    async update(req, res, next) {
        const { title, description, imageUrl } = req.body;

        if ('title' in req.body) {
            req.resource.title = title;
        }

        if ('description' in req.body) {
            req.resource.description = description;
        }

        if ('imageUrl' in req.body) {
            req.resource.imageUrl = imageUrl;
        }

        let status = 204;
        if (req.resource.isModified()) {
            await req.resource.save();
        } else {
            status = 304;
        }
        res.status(status).json(req.resource);
    }

    async delete(req, res, next) {
        await req.resource.deleteOne();

    }
}