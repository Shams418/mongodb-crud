import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  isVerifiedEmail: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },

  verify_code: {
    type: String,
    default: null,
  },
  verifyExpiredIn: {
    type: Date,
    default: null,
  },
  reset_token: {
    type: String,
    default: null,
  },
  tokenExpiredIN: {
    type: Date,
    default: null,
  },
  blogs:[{
    type : mongoose.Schema.ObjectId,
    ref :"Blog"
}]
});

export const User = mongoose.model("User", userSchema);
