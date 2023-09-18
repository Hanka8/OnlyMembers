const mongoose = require('mongoose');
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    title: {type: String, required: true},
    message: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'Member', required: true},
    timestamp: {type: Date, default: Date.now},
});

MessageSchema.virtual("due_back_formatted").get(function () {
  return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATE_MED);
});

MessageSchema.virtual("due_back_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.timestamp).toISODate(); // format 'YYYY-MM-DD'
});

module.exports = mongoose.model('Message', MessageSchema);