import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

/**
 * @file Defines the user model for the application.
 * @module userModel
 * @author Felix Berglund
 * @description This file defines the user model for the application,
 * including schema definition, password hashing, and authentication methods.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1
    },
    passwordHash: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
      }
    }
  }
)

/**
 * Pre-save hook to hash the password before saving the user document.
 * This ensures that the password is securely stored in the database.
 * The hook checks if the passwordHash field has been modified, and if so,
 * it hashes the new password using bcrypt with a salt rounds of 10.
 * This process is asynchronous to avoid blocking the event loop.
 * @returns {Promise<void>} A promise that resolves when the hashing is complete.
 */
userSchema.pre('save', async function () {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10)
  }
})

/**
 * Authenticates a user by their username and password.
 * @param {string} username  The username of the user to authenticate
 * @param {string} password  The plaintext password to compare against the stored password hash
 * @returns {Promise<Object|null>} A promise that resolves to the authenticated user object if the credentials are valid, or null if they are not
 */
userSchema.statics.authenticate = async function (username, password) {
  const user = await this.findOne({ username })
  if (!user) return null
  if (await bcrypt.compare(password, user.passwordHash)) return user
  return null
}

export const UserModel = mongoose.model('User', userSchema)
