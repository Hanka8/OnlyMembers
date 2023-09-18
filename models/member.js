const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password:{type: String, required: true},
    isAdmin: {type: Boolean, default: false}
});

module.exports = mongoose.model('Member', MemberSchema);