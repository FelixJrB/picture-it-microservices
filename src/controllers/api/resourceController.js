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
   *
   * @param {object} req - The request object.
   * @param {object} _res - The response object.
   * @param {import('express').NextFunction} next - The next middleware function.
   * @param {string} id - The ID of the resource to load.
   * @returns {Promise<void>} Resolves when the resource is loaded or an error is passed.
   */
  async loadResource(req, _res, next, id) {
    try {
      const resource = await Resource.findById(id)
      if (!resource) {
        const error = new Error('Resource not found')
        error.status = 404
        throw error
      }

      req.resource = resource
      return next()
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Find all resources.
   *
   * @param {object} req - The request object.
   * @param {object} res - The response object.
   * @param {import('express').NextFunction} next - The next middleware function.
   * @returns {Promise<void>} Resolves with a list of all resources for the authenticated user.
   */
  async findAll(req, res, next) {
    try {
      const resources = await Resource.find({ userId: req.user.sub }).sort({ createdAt: -1 })
      return res.json(resources)
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Find a specific resource by ID.
   *
   * @param {object} req - The request object, which should have the resource loaded in req.resource.
   * @param {object} res - The response object, used to send the appropriate status code and response.
   * @param {import('express').NextFunction} next - The next middleware function, used for error handling.
   * @returns {Promise<void>} Resolves with the resource if found and authorized, or passes an error.
   */
  async find(req, res, next) {
    try {
      if (req.resource.userId !== req.user.sub) {
        const error = new Error('Forbidden')
        error.status = 403
        return next(error)
      }
      return res.json(req.resource)
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Create a new resource.
   * Expects data and contentType in the request body, and optionally description and location.
   * Validates the input, sends the data to an image service to get an image URL, and saves the resource to the database.
   *
   * @param {object} req - The request object, which should have the user ID in req.user.sub and the resource data in req.body.
   * @param {object} res - The response object, used to send the appropriate status code and response.
   * @param {import('express').NextFunction} next - The next middleware function, used for error handling.
   * @returns {Promise<void>} Resolves with the created resource, or passes an error if the input is invalid or the image service fails.
   */
  async create(req, res, next) {
    try {
      const { contentType, data, description, location } = req.body

      // Validate that data and contentType are provided
      if (!data || !contentType) {
        return res.status(400).json({ error: 'Data and contentType are required' })
      }

      // Send to image service and get back the image URL (data contentType)
      const response = await fetch(process.env.PERSONAL_ACCESS_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN,
        },
        body: JSON.stringify({ data, contentType }),
      })
      const imageData = await response.json()

      if (!response.ok) {
        const error = new Error('Image service error')
        error.status = 502
        throw error
      }
      // Save the resource to the database with the returned image URL
      const resource = await Resource.create({
        imageUrl: imageData.imageUrl,
        contentType,
        description,
        location,
        userId: req.user.sub,
      })
      return res.status(201).json(resource)
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Update an existing resource. PUT - (/api/v1/images/:id)
   * Expects data and contentType in the request body, and optionally description and location.
   * Validates the input, sends the updated data to an image service to update the image, and saves the updated resource to the database.
   * Responds with 204 No Content if the update is successful, or 403 Forbidden if the user does not own the resource.
   *
   * @param {object} req - The request object, which should have the resource loaded in req.resource and the updated fields in req.body.
   * @param {object} res - The response object, used to send the appropriate status code and response.
   * @param {import('express').NextFunction} next - The next middleware function, used for error handling.
   * @returns {Promise<void>} Resolves with 204 No Content if the update is successful, or passes an error.
   */
  async update(req, res, next) {
    try {
      if (req.resource.userId !== req.user.sub) {
        const error = new Error('Forbidden')
        error.status = 403
        return next(error)
      }

      const { contentType, data, description, location } = req.body

      // Validate that data and contentType are provided
      if (!data || !contentType) {
        return res.status(400).json({ error: 'Data and contentType are required' })
      }

      // Extract the image ID from the existing image URL
      const imageId = req.resource.imageUrl.split('/').pop()

      // Send to image service,
      // expecting 204 No Content if the update is successful,
      // as no body is returned, only the status code
      await fetch(`${process.env.PERSONAL_ACCESS_TOKEN_URL}/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN,
        },
        body: JSON.stringify({ data, contentType }),
      })

      // Update metadata in database and save
      req.resource.contentType = contentType
      req.resource.description = description
      req.resource.location = location
      await req.resource.save()

      return res.status(204).send()
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Partially update an existing resource. Patch - (/api/v1/images/:id)
   * We update only the fields that are provided in the request body, and leave the rest unchanged.
   * Responds with 204 No Content if the update is successful, or 403 Forbidden if the user does not own the resource.
   *
   * @param {object} req - The request object, which should have the resource loaded in req.resource and the updated fields in req.body.
   * @param {object} res - The response object, used to send the appropriate status code and response.
   * @param {import('express').NextFunction} next - The next middleware function, used for error handling.
   * @returns {Promise<void>} Resolves with 204 No Content if the update is successful, or passes an error.
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

      return res.status(204).send()
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Delete a resource.
   * Responds with 204 No Content if deletion is successful,
   * or 403 if not authorized.
   *
   * @param {object} req - The request object, which should have the resource loaded in req.resource.
   * @param {object} res - The response object, used to send the appropriate status code and response.
   * @param {import('express').NextFunction} next - The next middleware function, used for error handling.
   * @returns {Promise<void>} Resolves with 204 No Content if deletion is successful, or passes an error.
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
      await fetch(`${process.env.PERSONAL_ACCESS_TOKEN_URL}/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN,
        },
      })

      await req.resource.deleteOne()
      return res.status(204).send()
    } catch (err) {
      return next(err)
    }
  }
}
