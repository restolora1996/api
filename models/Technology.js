const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Technology: TechnologySchema } = require('./schemas');

const Technology = new Schema(TechnologySchema);

module.exports = mongoose.model('Technology', Technology);
