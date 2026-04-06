/**
 * @file Defines the base schema for the application.
 * @module baseSchema
 * @author Felix Berglund
 * @description This file defines the base schema for the application,
 * including common schema options and transformations.
 */

import mongoose from 'mongoose'

// Options to use when converting document to plain object and JSON
const convertOptions = Object.freeze({
  getters: true, // include getters and virtual properties
  versionKey: false, // exclude the __v property
  /**
   * Transforms the document, removing the _id property.
   *
   * @param {object} _doc - The mongoose document which is being converted.
   * @param {object} ret - The plain object representation which has been converted.
   * @returns {object} The transformed object.
   * @see https://mongoosejs.com/docs/api.html#document_Document-toObject
   */
  transform: (_doc, ret) => {
    delete ret._id // Exclude the _id property
    return ret
  },
})

// Create a base schema
const baseSchema = new mongoose.Schema(
  {},
  {
    timestamps: true, // adds createdAt and updatedAt fields
    // Set the options to use when convering document to a POJO (or DTO) or JSON
    // POJO: Plain Old JavaScript Object
    // DTO: Data Transfer Object
    toObject: convertOptions,
    toJSON: convertOptions,
    // Enable optimistic concurrency control. This is a strategy to ensure the
    // document you're updating didn't change between when you loaded it, and
    // when you update it.
    optimisticConcurrency: false,
  }
)
// Export the base schema, frozen to prevent modifications
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
// Sent to PostModel.js, where it is added to the Post schema.
//
export const Schema = Object.freeze(baseSchema)
