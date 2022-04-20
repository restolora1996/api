const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { GetInTouch: GetInTouchSchema } = require('./schemas');

const GetInTouch = new Schema(GetInTouchSchema);

module.exports = mongoose.model('GetInTouch', GetInTouch);
