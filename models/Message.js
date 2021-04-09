const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const MessageSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  chatRoomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "conversation",
  },
  messageId: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  media: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("message", MessageSchema);
