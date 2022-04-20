// const mongoose = require('mongoose');

exports.Schemas = {
	About: {
		Description: {
			type: String,
			required: true
		}
	},
	Banner: {
		BannerName: {
			type: String,
			required: true
		},
		Description: {
			type: String,
			required: false
		},
		Image: {
			type: String,
			required: false
		}
	},
	GetIntouch: {
		Name: {
			type: String,
			required: true
		},
		EmailAddress: {
			type: String,
			required: true
		},
		Message: {
			type: String,
			required: true
		}
	},
	Technology: {
		TechnologyName: {
			type: String,
			required: true
		},
		Description: {
			type: String,
			required: true
		},
		Image: {
			type: String,
			required: true
		}
	},
	Users: {
		FirstName: {
			type: String,
			required: true
		},
		MiddleName: {
			type: String,
			required: true
		},
		LastName: {
			type: String,
			required: true
		},
		Gender: {
			type: Number,
			required: false
		},
		BirthDate: {
			type: Date,
			required: false
		},
		MobileNumber: {
			type: String,
			required: true
		},
		EmailAddress: {
			type: String,
			required: true
		},
		Facebook: {
			type: String,
			required: false
		},
		LinkedIn: {
			type: String,
			required: false
		}
	}
};
