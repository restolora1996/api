const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Schemas } = require('./schemas');

const About = new Schema(Schemas.About);

module.exports = mongoose.model('About', About);
