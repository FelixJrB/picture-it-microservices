import { Resource } from '../../models/Resource.js';

/**
 * Controller for handling CRUD operations on resources.
 * Each method corresponds to a specific operation:
 * - loadResource: Middleware to load a resource by ID and attach it to the request object
 * - findAll: Retrieve all resources
 * - find: Retrieve a specific resource by ID
 * - create: Create a new resource
 * - update: Update an existing resource
 * - delete: Delete a resource
 * 
 * Each method uses async/await for asynchronous operations and includes error handling to ensure proper responses are sent to the client.
 */
export class resourceController {
    /**
     * Loads a resource by ID and attaches it to the request object.
     * @param {*} req The request object
     * @param {*} res The response object
     * @param {*} next The next middleware function
     * @param {*} id The ID of the resource to load
     */
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

    /**
     * Find all resources.
     * @param {*} req The request object
     * @param {*} res The response object
     * @param {*} next The next middleware function
     */
    async findAll(req, res, next) {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.json(resources);
    }

    /**
     * Find a specific resource by ID.
     * @param {*} req The request object, which should have the resource loaded in req.resource
     * @param {*} res The response object, used to send the appropriate status code and response
     * @param {*} next The next middleware function, used for error handling
     */
    async find(req, res, next) {
        res.json(req.resource);
    }

    /**
     * Create a new resource. 
     * Expects title and description in the request body, and optionally imageUrl.
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    async create(req, res, next) {
        const { title, description, imageUrl } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const resource = await Resource.create({ title, description, imageUrl });
        res.status(201).json(resource);
    }

    /**
     * Update a resource. Only fields provided in the request body will be updated.
     * @param {*} req The request object, which should have the resource loaded in req.resource and the updated fields in req.body
     * @param {*} res The response object, used to send the appropriate status code and response
     * @param {*} next The next middleware function, used for error handling
     */
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

    /**
     * Delete a resource. 
     * Responds with 204 No Content if deletion is successful, 
     * or 404 Not Found if the resource does not exist.
     * @param {*} req The request object, which should have the resource loaded in req.resource
     * @param {*} res The response object, used to send the appropriate status code and response
     * @param {*} next The next middleware function, used for error handling
     */
    async delete(req, res, next) {
        await req.resource.deleteOne();
        res.status(204).send();

    }
}