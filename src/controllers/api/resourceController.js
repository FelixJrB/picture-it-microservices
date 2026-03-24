import { Resource } from '../../models/Resource.js'

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
                const error = new Error('Resource not found')
                error.status = 404
                throw error
            }

            req.resource = resource
            next()
        } catch (error) {
            next(error)
        }
    }

    /**
     * Find all resources.
     * @param {*} req The request object
     * @param {*} res The response object
     * @param {*} next The next middleware function
     */
    async findAll(req, res, next) {
        try {
            const resources = await Resource.find({ userId: req.user.sub }).sort({ createdAt: -1 });
            res.json(resources)
        } catch (error) {
            next(error)
        }
    }

    /**
     * Find a specific resource by ID.
     * @param {*} req The request object, which should have the resource loaded in req.resource
     * @param {*} res The response object, used to send the appropriate status code and response
     * @param {*} next The next middleware function, used for error handling
     */
    async find(req, res, next) {
        try {
            if (req.resource.userId !== req.user.sub) {
                const error = new Error('Forbidden')
                error.status = 403
                return next(error)
            }
            res.json(req.resource)
        } catch (error) {
            next(error)
        }
    }

    /**
     * Create a new resource. 
     * Expects data and contentType in the request body, and optionally description and location.
     * Validates the input, sends the data to an image service to get an image URL, and saves the resource to the database.
     * 
     * @param {*} req The request object, which should have the user ID in req.user.sub and the resource data in req.body.
     * @param {*} res The repsone object, used to send the appropriate status code and response.
     * @param {*} next The next middleware function, used for error handling.
     * @returns 
     */
    async create(req, res, next) {
        try {
            const { data, contentType, description, location } = req.body

            // Validate that data and contentType are provided
            if (!data || !contentType) {
                return res.status(400).json({ error: 'Data and contentType are required' })
            }

            // Send to image service and get back the image URL (data contentType)
            const response = await fetch(process.env.PERSONAL_ACCESS_TOKEN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
                },
                body: JSON.stringify({ data, contentType })
            })
            const imageData = await response.json()

            // Save the resource to the database with the returned image URL
            const resource = await Resource.create({
                imageUrl: imageData.imageUrl,
                contentType,
                description,
                location,
                userId: req.user.sub
            })
            res.status(201).json(resource)
        } catch (error) {
            next(error)
        }
    }

    /**
     * Update an existing resource. PUT - (/api/v1/images/:id)
     * Expects data and contentType in the request body, and optionally description and location.
     * Validates the input, sends the updated data to an image service to update the image, and saves the updated resource to the database.
     * Responds with 204 No Content if the update is successful, or 403 Forbidden if the user does not own the resource.
     * 
     * @param {*} req The request object, which should have the resource loaded in req.resource and the updated fields in req.body
     * @param {*} res The response object, used to send the appropriate status code and response
     * @param {*} next The next middleware function, used for error handling
     */
    async update(req, res, next) {

        try {
            if (req.resource.userId !== req.user.sub) {
                const error = new Error('Forbidden')
                error.status = 403
                return next(error)
            }

            const { data, contentType, description, location } = req.body

            // Validate that data and contentType are provided
            if (!data || !contentType) {
                return res.status(400).json({ error: 'Data and contentType are required' })
            }

            // Extract the image ID from the existing image URL
            const imageId = req.resource.imageUrl.split('/').pop()

            // Send to image service, 
            // expecting 204 No Content if the update is successful, 
            // as no body is returned, only the status code
            const response = await fetch(`${process.env.PERSONAL_ACCESS_TOKEN_URL}/${imageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
                },
                body: JSON.stringify({ data, contentType })
            })

            // Update metadata in database and save
            req.resource.contentType = contentType
            req.resource.description = description
            req.resource.location = location
            await req.resource.save()


            res.status(204).send()
        } catch (error) {
            next(error)
        }
    }


    /**
     * Partially update an existing resource. Patch - (/api/v1/images/:id)
     * We update only the fields that are provided in the request body, and leave the rest unchanged.
     * Responds with 204 No Content if the update is successful, or 403 Forbidden if the user does not own the resource.
     * 
     * @param {*} req The request object, which should have the resource loaded in req.resource and the updated fields in req.body
     * @param {*} res The response object, used to send the appropriate status code and response
     * @param {*} next The next middleware function, used for error handling
     */
    async partialUpdate(req, res, next) {

        try {
            if (req.resource.userId !== req.user.sub) {
                const error = new Error('Forbidden')
                error.status = 403
                return next(error)
            }

            // Only update fields that are provided in the request body
            if ('description' in req.body) req.resource.description = req.body.description
            if ('location' in req.body) req.resource.location = req.body.location
            await req.resource.save()

            res.status(204).send()
        } catch (error) {
            next(error)
        }
    }

    /**
     * Delete a resource. 
     * Responds with 204 No Content if deletion is successful, 
     * or 403 if not authorized.
     * @param {*} req The request object, which should have the resource loaded in req.resource
     * @param {*} res The response object, used to send the appropriate status code and response
     * @param {*} next The next middleware function, used for error handling
     */
    async delete(req, res, next) {
        try {
            if (req.resource.userId !== req.user.sub) {
                const error = new Error('Not authorized')
                error.status = 403
                return next(error)
            }

            // Extract the image ID from the existing image URL
            const imageId = req.resource.imageUrl.split('/').pop()

            // Send to image service, 
            // expecting 204 No Content if the deletion is successful, 
            // as no body is returned, only the status code
            const response = await fetch(`${process.env.PERSONAL_ACCESS_TOKEN_URL}/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
                },
            })

            await req.resource.deleteOne();
            res.status(204).send();
        } catch (error) {
            next(error)
        }
    }
}