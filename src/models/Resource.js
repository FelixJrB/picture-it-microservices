/**
 * @file Defines the resource model for the application.
 * @module resourceModel
 * @author Felix Berglund
 * @description This file defines the resource model for the application,
 * including schema definition and relationships.
 */

import mongoose from 'mongoose'
import { Schema } from './baseSchema.js'

const schema = new mongoose.Schema({
    imageUrl: {
      type: String,
  },
  contentType: {
    type: String,
    required: true
  },
  location: {
    type: String,
    trim: true,
    minlength: 1
  },
  description: {
    type: String,

    trim: true,
    minlength: 1
  },
  userId: {
    type: String,
    required: true
  }
})

// Add base schema fields to this schema,inherited from baseSchema.js
//
schema.add(Schema)

export const Resource = mongoose.model('Resource', schema)
