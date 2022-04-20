const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Users: UsersSchema } = require('./schemas');

const Users = new Schema(UsersSchema);

module.exports = mongoose.model('Users', Users);
