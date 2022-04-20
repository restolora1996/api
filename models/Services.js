const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Services: ServicesSchema } = require('./schemas');

const Services = new Schema(ServicesSchema);

module.exports = mongoose.model('Services', Services);
