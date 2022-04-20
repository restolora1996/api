const { keys, omit, pick } = require('lodash');
const { convertSlugToId } = require('../config');
const { C, M } = require('../models/database');
const apiReturn = require('./apiReturn');

module.exports = async (params = {}) => {
	let {
		all,
		autoPopulate,
		count,
		database,
		entityId,
		fields,
		fileFolder,
		filter,
		ids,
		keywords,
		limit,
		offset,
		page,
		populate,
		schema,
		// schemas,
		sortBy
	} = (({
		all = false,
		autoPopulate = true,
		count = false,
		database = 'Aha',
		entityId = '',
		fields = [],
		fileFolder = '',
		filter = {},
		ids = [],
		keywords = '',
		limit = 50,
		offset,
		page = 1,
		populate = [],
		schema = {},
		// schemas = [],
		sortBy = {}
	}) => ({
		all: JSON.parse(all),
		autoPopulate: JSON.parse(autoPopulate),
		count: JSON.parse(count),
		database,
		entityId,
		fields,
		fileFolder,
		filter,
		ids,
		keywords: keywords != '' ? keywords.split(' ') : [],
		limit: offset ? parseInt(page) * parseInt(limit) : parseInt(limit),
		offset: offset ? parseInt(offset) : parseInt(page) * parseInt(limit) - parseInt(limit),
		page: parseInt(page),
		populate,
		schema,
		// schemas,
		sortBy
	}))(params);

	const connection = C(database);

	const actualFields = Object.keys(schema);
	let queries = {};

	// FILTERS
	if (ids.length !== 0) queries['$or'] = ids.map(id => ({ _id: id }));

	if (keywords.length) {
		let andQuery = [];
		keywords.map(keyword => {
			let orQuery = [];
			for (var i in schema) {
				const type = Array.isArray(schema[i]) ? schema[i][0].tempType : schema[i].tempType;
				if (!['password', 'number', 'date', 'boolean', 'reference', 'file', 'order'].includes(type))
					orQuery.push({ [i]: { $regex: new RegExp(keyword), $options: 'i' } });
			}
			andQuery.push({ $or: orQuery });
		});
		queries['$and'] = andQuery;
	}

	/**
	 * SORT BY
	 */
	let sortByFields = {};
	for (const d in sortBy) {
		if (actualFields.includes(d) || d == '_id' || d == 'DateCreated' || d == 'DateUpdated') {
			sortByFields[d] = parseInt(sortBy[d]);
		}

		if (d == 'Id') sortByFields['_id'] = parseInt(sortBy[d]);
	}
	sortBy = { ...sortByFields };
	sortBy = keys(sortBy).length > 1 ? omit(sortBy, ['_id', 'DateCreated', 'DateUpdated']) : sortBy;

	/**
	 * FILTER
	 */

	filter = { ...convertSlugToId(filter, schema) };
	queries = { ...queries, ...filter };

	let newFields = fields.reduce(
		(a, b) => (actualFields.includes(b) || b == 'DateCreated' || b == 'DateUpdated' ? { ...a, [b]: true } : a),
		{}
	);

	if (Object.keys(newFields).length == 0) {
		actualFields.map(d => (newFields[d] = true));
		newFields['DateCreated'] = true;
		newFields['DateUpdated'] = true;
	}

	/**
	 * REFERENCES
	 */
	// let schemaObj = {};
	// schemas.map(d => (schemaObj[d.Id] = d.Schema));

	// const { references: initialReference, tableIds } = generateReferences(schemaObj, schemaObj[entityId], entityId);
	// tableIds.map(id => M(connection, id, schemaObj[id]));

	// let references = [];
	// if (autoPopulate) {
	// 	Object.keys(initialReference).map(key => references.push(initialReference[key]));
	// } else {
	// 	references = populate.filter(d => initialReference[d]).map(d => initialReference[d]);
	// }

	/**
	 * GET DATA
	 */
	let [data, totalResults, total] = await Promise.all([
		new Promise(resolve => {
			if (count) return resolve([]);

			let options = all ? {} : { limit, skip: offset };
			options = {
				...options,
				sort: Object.keys(sortBy).length ? sortBy : { _id: -1 },
				collation: { locale: 'en_US', strength: 1 }
			};

			// if (references.length !== 0) {
			// 	let query = M(connection, entityId, schema).find(queries, newFields, options);
			// 	references.map(d => query['populate'](d));
			// 	query.exec((err, rows) => {
			// 		if (err) return resolve([]);
			// 		resolve(rows);
			// 	});
			// } else {
			M(connection, entityId, schema).find(queries, newFields, options, (err, rows) => {
				if (err) return resolve([]);
				resolve(rows);
			});
			// }
		}),
		new Promise(resolve => {
			M(connection, entityId, schema).countDocuments(queries, (err, count) => {
				if (err) return resolve(0);
				resolve(count);
			});
		}),
		new Promise(resolve => {
			M(connection, entityId, schema).countDocuments({}, (err, count) => {
				if (err) return resolve(0);
				resolve(count);
			});
		})
	]);

	// if (!count) {
	// const newFieldsArr = Object.keys(newFields);
	// const newSchema = newFieldsArr.length !== 0 ? pick(schema, newFieldsArr) : { ...schema };
	// data = data.map(d => arrangeData(d, newSchema, schemas, fileFolder, entityUniqueId));
	// }

	return apiReturn({ all, count, data, limit, offset, page, total, totalResults });
};
