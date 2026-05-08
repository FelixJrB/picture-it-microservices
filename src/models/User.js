import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

/**
 * @file Defines the user model for the application.
 * @module userModel
 * @author Felix Berglund
 * @description This file defines the user model for the application,
 * including schema definition, password hashing, and authentication methods.
 * It uses Mongoose for MongoDB interactions and bcrypt for secure password hashing.
 * The user model includes fields for username, password hash, first name, last name, email, and refresh token.
 * It also includes a pre-save hook to hash the password before saving and a static method for authenticating users.
 * Gets stored in the database with a hashed password, and provides a method to authenticate users by comparing the provided password with the stored hash.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    refreshToken: { // save the refresh token in the database for later validation and revocation if needed.
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      /**
       * Custom transformation function to modify the output when converting a user document to JSON.
       * This function adds an 'id' field with the string representation of the '_id' field,
       * and removes the '_id', '__v', and 'passwordHash' fields from the output.
       *
       * @param {object} _doc - The Mongoose document being converted to JSON.
       * @param {object} ret - The plain JavaScript object representation of the document that will be returned as JSON.
       */
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
      },
    },
  }
)

/**
 * Pre-save hook to hash the password before saving the user document.
 * This ensures that the password is securely stored in the database.
 * The hook checks if the passwordHash field has been modified, and if so,
 * it hashes the new password using bcrypt with a salt rounds of 10.
 * This process is asynchronous to avoid blocking the event loop.
 *
 * @returns {Promise<void>} A promise that resolves when the hashing is complete.
 */
userSchema.pre('save', async function () {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10)
  }
})

/**
 * Authenticates a user by their username and password.
 *
 * @param {string} username  The username of the user to authenticate
 * @param {string} password  The plaintext password to compare against the stored password hash
 * @returns {Promise<object | boolean>} A promise that resolves to the authenticated user object if the credentials are valid, or false if they are not.
 */
userSchema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })
  if (!user) return false
  const isMatch = await bcrypt.compare(password, user.passwordHash)
  return isMatch ? user : false
}

export const UserModel = mongoose.model('User', userSchema)
