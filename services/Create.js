const About = require('../models/About');

module.exports = async fields => {
	try {
		return await About.create(fields);
	} catch (err) {
		console.log(err);
		return false;
	}
};
