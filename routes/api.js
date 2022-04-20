const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Database = 'portpolio';
const { C, M } = require('../models/database');
const { Schemas } = require('../models/schemas');
const { secretKey } = require('../config');
const multer = require('multer');
const getData = require('../function/getData');

router.use('/*', async (req, res, next) => {
	let token = req.headers.authorization || req.query.token;
	if (!token) return res.status(401).send('No token provided');

	// // verify token
	let decoded = {};
	// try {
	// 	decoded = await new Promise((resolve, reject) => {
	// 		jwt.verify(token, secretKey, (err, decoded) => {
	// 			if (err) return reject('Failed to authenticate token');
	// 			resolve(decoded);
	// 		});
	// 	});
	// } catch (error) {
	// 	return res.status(401).send(error);
	// }

	// // get application and user
	let { account = {}, expiration = '1h' } = decoded,
		user = {};

	// // generate token
	const newToken = jwt.sign({ account }, secretKey, { expiresIn: expiration });
	req.query.newToken = newToken;
	res.set('Authorization', newToken);
	next();
});

router.get('/', (req, res, next) => {
	res.send('API');
});

const upload = multer({
	limits: { fieldNameSize: 999999999, fieldSize: 999999999 }
	// storage: multerS3({
	// 	s3: awsS3,
	// 	bucket: 'images.aha.volenday.com',
	// 	acl: 'public-read',
	// 	cacheControl: 'max-age=2592000',
	// 	contentType: (req, file, cb) => {
	// 		const typeFromPlugin = mime.getType(file.originalname);
	// 		const type = file.mimetype ? file.mimetype : typeFromPlugin ? typeFromPlugin : 'application/octet-stream';
	// 		cb(null, type);
	// 	},
	// 	key: (req, file, cb) => {
	// 		const { EntityId } = req.params;
	// 		const { application, schemasById } = req.query;
	// 		const { mimetype, originalname: fileName } = file;

	// 		const schema = { ...schemasById[EntityId] };

	// 		let newFileName = '';
	// 		if (fileName.includes('.')) {
	// 			const splittedFileName = fileName.split('.'),
	// 				extension = splittedFileName.pop(),
	// 				fileNameWithoutExtension = splittedFileName.join('.').replace(/[^\w]/gi, '-');

	// 			newFileName = fileNameWithoutExtension + '-' + v1() + '.' + extension;
	// 			cb(null, `${environment}/applications/${application.Id}/images/${schema.UniqueId}/${newFileName}`);
	// 		} else {
	// 			const extension = mime.getExtension(mimetype);
	// 			if (mimetype == 'application/octet-stream' || !extension) {
	// 				newFileName = fileName + '-' + v1();
	// 			} else {
	// 				newFileName = fileName + '-' + v1() + '.' + extension;
	// 			}
	// 		}

	// 		cb(null, `${environment}/applications/${application.Id}/images/${schema.UniqueId}/${newFileName}`);
	// 	}
	// })
});

// insert
router.post('/e/:EntityId', upload.any(), async (req, res, next) => {
	const { EntityId } = req.params;
	let fields = { ...req.body },
		files = req.files ? [...req.files] : [];
	const schemas = Schemas[EntityId];

	try {
		const insertedId = await new Promise((resolve, reject) => {
			M(C(Database), EntityId, schemas).create(fields, (err, inserted) => {
				if (err) return reject(err);
				resolve(inserted);
			});
		});
		res.status(200).send({ message: 'Successfully Added', data: insertedId });
	} catch (error) {
		console.log('error', error.message);
		res.status(412).send(error.message);
	}
});

const getAll = async (req, res) => {
	const { EntityId } = req.params;
	const { application, schemas, schemasById } = req.query;

	let {
		all,
		access,
		account,
		autoPopulate,
		cacheExpiration = null,
		cacheKey = null,
		count,
		fields,
		filter,
		ids,
		keywords,
		limit,
		offset,
		page,
		populate,
		sortBy
	} = req.method === 'GET' ? req.query : req.body;

	const schema = Schemas[EntityId];

	if (!schema) return res.status(412).send('Something went wrong, looks like entity schema is not found');

	try {
		const response = await getData({
			all,
			autoPopulate,
			count,
			database: Database,
			entityId: EntityId,
			// entityUniqueId: schema.UniqueId,
			fields,
			// fileFolder: application.Id,
			filter,
			ids,
			keywords,
			limit,
			offset,
			page,
			populate,
			schema: schema,
			// schemas,
			sortBy
		});

		if (cacheKey) {
			const shouldInsertToCache =
				response.data.length !== 0
					? Object.keys(response.data[0]).length === 3 &&
					  Object.keys(response.data[0]).includes('Id') &&
					  Object.keys(response.data[0]).includes('DateCreated') &&
					  Object.keys(response.data[0]).includes('DateUpdated')
						? false
						: true
					: true;
			if (shouldInsertToCache) client.set(cacheKey, JSON.stringify(response), 'EX', cacheExpiration);
		}

		res.status(200).send(response);
	} catch (error) {
		console.log(error);
		res.status(412).send({ message: 'Something went wrong.', error: error.message });
	}
};

// retrieve
router.get('/e/:EntityId', getAll);
// // // retrieve

// router.get('/e/:EntityId', async (req, res) => {
// 	const { EntityId } = req.params;
// 	const schemas = Schemas[EntityId];
// 	try {
// 		const data = await new Promise((resolve, reject) => {
// 			M(C(Database), EntityId, schemas).find((err, data) => {
// 				if (err) return reject(err);
// 				resolve(data);
// 			});
// 		});
// 		res.status(200).send({ data });
// 	} catch (error) {
// 		console.log('error', error);
// 		res.status(412).send(error.message);
// 	}
// });

// getData by id
router.get('/e/:EntityId/:id', async (req, res) => {
	const { EntityId, id } = req.params;
	const schemas = Schemas[EntityId];
	try {
		const data = await new Promise((resolve, reject) => {
			M(C(Database), EntityId, schemas).findById(id, (err, data) => {
				if (err) return reject(err);
				resolve(data);
			});
		});
		res.status(200).send({ data });
	} catch (error) {
		console.log('error', error);
		res.status(412).send(error.message);
	}
});

// update
router.put('/e/:EntityId/:id', upload.any(), async (req, res) => {
	const { EntityId, id } = req.params;
	let fields = { ...req.body };
	const schema = Schemas[EntityId];
	try {
		let data = await M(C(Database), EntityId, schema).findById(id).exec();
		if (!data) res.status(412).send({ message: 'Updating failed, data is not found', data: {} });

		await new Promise((resolve, reject) => {
			M(C(Database), EntityId, schema).findOneAndUpdate(
				{ _id: id },
				{ $set: fields },
				{ runValidators: true, context: 'query' },
				err => {
					if (err) return reject(err);
					resolve();
				}
			);
		});

		const response = await getData({
			database: Database,
			entityId: EntityId,
			ids: [id],
			schema
		});

		res.status(200).send({ message: 'Successfully updated', data: response.data[0] });
	} catch (error) {
		console.log('error', error);
		res.status(412).send(error.message);
	}
});

//delete
router.delete('/e/:EntityId/:id', async (req, res) => {
	const { EntityId, id: _id } = req.params;
	const schemas = Schemas[EntityId];
	try {
		let data = await M(C(Database), EntityId, schemas).findById(_id).exec();

		if (!data) res.status(412).send({ message: 'Deletion failed, data is not found' });

		await M(C(Database), EntityId, schemas).deleteOne({ _id }).exec();

		res.status(200).send({ message: 'Successfully deleted', data });
	} catch (error) {
		console.log('error', error);
		res.status(412).send(error.message);
	}
});

module.exports = router;
