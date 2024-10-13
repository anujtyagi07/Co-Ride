import mongoose from "mongoose";
import validator from "validator";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'


dotenv.config({ path: './.env' });
const getCurrentTime = () => {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
const administratorSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },

  password:{
    type:String,
  },

  senders: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TempUser",
      },


      sendDate: {
        type: Date,
        default: Date.now,
      },
      sendTime: {
        type: String,
        default: getCurrentTime,
      },
      approved: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

console.log(process.env.ADMIN_SECRET_KEY);

administratorSchema.methods.getJWT = function () {
  return jwt.sign({ id: this._id }, process.env.USER_SECRET_KEY, {
    expiresIn: "5d",
  });
};

export const Administrator = new mongoose.model(
  "Administrator",
  administratorSchema
);


