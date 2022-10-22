//IMPORT MONGOOSE
import mongoose, { Model } from "mongoose";
// const shortid = require("shortid");

// CONNECTING TO MONGOOSE (Get Database Url from .env)
const DATABASE_URL = process.env.DATABASE_URL;

// connection function
export const connect = async () => {
  const conn = await mongoose
    .connect(DATABASE_URL)
    .catch((err) => console.log(err));
  console.log("Mongoose Connection Established");

  // COMRADE SCHEMA
  const UserSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
		date: {
      type: Number,
      default: Date.now(),
      required: false,
    },
	})

	const MessageSchema = new mongoose.Schema({
    _userId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User'
		},
    message: {
      type: String,
      required: true,
    },
		date: {
      type: Number,
      default: Date.now(),
      required: false,
    },
	})
	

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

	const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

  return { conn, User, Message };
};