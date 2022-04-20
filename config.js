exports.mongoConnectionString = {
	development: 'mongodb+srv://Portpolio:Ewankosay0@cluster0.qzia9.mongodb.net',
	cluster: 'mongodb+srv://Portpolio:Ewankosay0@cluster0.qzia9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
};
exports.secretKey = "XmK/U'g<=Ce4741``4JQfJGG7S/mR$8q8dg%E0Xd6+Y/8iH^>AdsV89(T:8480o";
exports.convertSlugToId = (toConvert, originalSchema, mysql = false) => {
	var toConvert = typeof toConvert == 'object' ? { ...toConvert } : toConvert,
		converted = {},
		schema = { ...originalSchema };

	Object.keys(schema).map(key => {
		if (Array.isArray(schema[key])) {
			schema[key] = Object.assign({}, schema[key][0], { id: key });
		} else {
			schema[key] = Object.assign({}, schema[key], { id: key });
		}
	});

	if (typeof toConvert == 'object') {
		Object.keys(toConvert).map(key => {
			var newKey = key,
				newValue = toConvert[key];

			//key
			if (typeof schema[key] != 'undefined') {
				newKey = schema[key].id;
				previousKey = key;
			}

			//values
			if (typeof toConvert[key] == 'object') {
				if (toConvert[key] instanceof RegExp) {
					newValue = toConvert[key];
				} else {
					if (!mysql) {
						if (Array.isArray(toConvert[key])) {
							newValue = toConvert[key].map(d => exports.convertSlugToId(d, originalSchema));
						} else {
							newValue = exports.convertSlugToId(toConvert[key], originalSchema);
						}
					}
				}
			} else {
				//string
				if (typeof schema[key] != 'undefined') {
					//with schema
					if (schema[key].tempType == 'reference') {
						//reference
						if (!mysql) newValue = newValue !== '' ? mongoose.Types.ObjectId(newValue) : null;
					}
				}
			}

			if (typeof newValue == 'string') {
				//regex checking
				let firstChar = newValue.substr(0, 1),
					secondChar = newValue.substr(newValue.length - 2, 2);
				if (firstChar == '/' && secondChar == '/i') {
					newValue = new RegExp(
						newValue
							.split('')
							.slice(1, newValue.length - 2)
							.join(''),
						'i'
					);
				}

				//mysql boolean checking
				if (mysql && (newValue === 'true' || newValue === 'false')) {
					newValue = newValue === 'true' ? 1 : newValue === 'false' ? 0 : '';
				}
			}

			converted[newKey] = newValue;
		});
	} else {
		//if it's string
		if (schema[previousKey]) {
			if (schema[previousKey].tempType == 'reference') {
				//If object Id was passed
				if (toConvert !== '' && mongoose.Types.ObjectId.isValid(toConvert)) {
					toConvert = mongoose.Types.ObjectId(toConvert);
				} else {
					toConvert = null;
				}
			}

			if (typeof toConvert == 'string') {
				//regex checking
				let firstChar = toConvert.substr(0, 1),
					secondChar = toConvert.substr(toConvert.length - 2, 2);
				if (firstChar == '/' && secondChar == '/i') {
					toConvert = new RegExp(
						toConvert
							.split('')
							.slice(1, toConvert.length - 2)
							.join(''),
						'i'
					);
				}
			}
		}

		converted = toConvert;
	}

	return converted;
};
