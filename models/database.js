const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { mongoConnectionString } = require('../config');
const { Schemas } = require('../models/schemas');
mongoose.Promise = global.Promise;

let conn = {};
exports.C = dbName => {
	if (conn[dbName]) {
		return conn[dbName];
	} else {
		conn[dbName] = mongoose.createConnection(
			`${mongoConnectionString.development}/${dbName}?retryWrites=true&w=majority`,
			{ useNewUrlParser: true, useUnifiedTopology: true },
			err => (err ? console.log('Connection error', err) : console.log('connected'))
		);
		return conn[dbName];
	}
};

exports.M = (db, modelName, schema) => {
	if (typeof db.models[modelName]) delete db.models[modelName];

	const modelSchema = new mongoose.Schema(schema, {
		collection: modelName,
		timestamps: {
			createdAt: 'DateCreated',
			updatedAt: 'DateUpdated'
		},
		minimize: false
	});

	modelSchema.plugin(uniqueValidator);

	return db.model(modelName, modelSchema);
};
