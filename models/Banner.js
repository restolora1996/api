const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Banner: BannerSchema } = require('./schemas');

const Banner = new Schema(BannerSchema);

module.exports = mongoose.model('Banner', Banner);
