const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const ChatSchema = new Schema({
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

module.exports = mongoose.model("chat", ChatSchema);
