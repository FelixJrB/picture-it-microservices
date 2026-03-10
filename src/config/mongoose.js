/**
 * @file Contains the configuration for the Mongoose ODM.
 * @module mongooseConfig
 * @author Felix Berglund
 * @description This file configures Mongoose settings, sets up event listeners,
 * and handles graceful shutdown for the MongoDB connection.
 */

import mongoose from 'mongoose'

/**
 * Mongoose confuguration and connection module.
 * Sets up Mongoose with strict mode, event listeners, and graceful shutdown.
 *
 * @param {string} connectionString - MongoDB connection string
 * @returns {Promise<mongoose.Connection>} - Mongoose connection instance
 */
export const connectToMongoDB = async (connectionString) => {
  const { connection } = mongoose

  // will cause errors to be prodced instead of silent failures
  mongoose.set('strict', 'throw')

  // Turn on strict mode for query filters
  mongoose.set('strictQuery', true)

  // Event listeners
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB')
  })

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err)
  })

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB')
  })

  // Graceful shutdown/ termination handling
  for (const signalEvent of ['SIGINT', 'SIGTERM']) {
    process.on(signalEvent, () => {
      (async () => {
        await connection.close()
        console.log(
          `Mongoose disconnected from MongoDB through ${signalEvent}.`
        )
        process.exit(0)
      })()
    })
  }

  return mongoose.connect(connectionString)
}
