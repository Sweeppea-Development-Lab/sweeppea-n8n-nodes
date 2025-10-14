/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 1.0
	Path      : /mock-server/server.js

	(c) Sweeppea, all rights reserved.
*/

const express = require('express');
const cors    = require('cors');
const app     = express();
const PORT    = 3002;

/* Middleware */
app.use(cors());
app.use(express.json());

/* Test API Key */
const VALID_API_KEY = 'sk_test_mock123456789';

/* In-Memory Database */
const sweepstakes = {
	summer_2025: {
		sweepstakeId : 'summer_2025',
		name         : 'Summer Mega Giveaway 2025',
		status       : 'active',
		fields       : [
			{
				name        : 'email',
				displayName : 'Email Address',
				type        : 'string',
				required    : true,
				validation  : { format: 'email' },
				placeholder : 'john@example.com'
			},
			{
				name        : 'firstName',
				displayName : 'First Name',
				type        : 'string',
				required    : true,
				validation  : { minLength: 2, maxLength: 50 },
				placeholder : 'John'
			},
			{
				name        : 'lastName',
				displayName : 'Last Name',
				type        : 'string',
				required    : true,
				validation  : { minLength: 2, maxLength: 50 },
				placeholder : 'Doe'
			},
			{
				name        : 'phone',
				displayName : 'Phone Number',
				type        : 'string',
				required    : false,
				validation  : { format: 'phone' },
				placeholder : '+1234567890'
			},
			{
				name        : 'age',
				displayName : 'Age',
				type        : 'number',
				required    : true,
				validation  : { min: 18, max: 120, integer: true },
				placeholder : '25'
			},
			{
				name        : 'country',
				displayName : 'Country',
				type        : 'options',
				required    : true,
				options     : ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Spain', 'Argentina'],
				placeholder : 'Select your country'
			},
			{
				name        : 'newsletter',
				displayName : 'Subscribe to Newsletter',
				type        : 'boolean',
				required    : false,
				placeholder : 'true'
			}
		]
	},
	holiday_special: {
		sweepstakeId : 'holiday_special',
		name         : 'Holiday Special Giveaway',
		status       : 'active',
		fields       : [
			{
				name        : 'email',
				displayName : 'Email Address',
				type        : 'string',
				required    : true,
				validation  : { format: 'email' },
				placeholder : 'user@example.com'
			},
			{
				name        : 'fullName',
				displayName : 'Full Name',
				type        : 'string',
				required    : true,
				validation  : { minLength: 3, maxLength: 100 },
				placeholder : 'John Doe'
			},
			{
				name        : 'favoriteHoliday',
				displayName : 'Favorite Holiday',
				type        : 'options',
				required    : true,
				options     : ['Christmas', 'New Year', 'Halloween', 'Thanksgiving', 'Easter'],
				placeholder : 'Select your favorite holiday'
			}
		]
	}
};

const participants = [];

/*
 * Middleware Used To Authenticate API Key
 */
const authenticateApiKey = (_req, _res, next) => {

	const authHeader = _req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {

		/* Return FALSE */
		return _res.status(401).json({
			success : false,
			error   : 'Unauthorized',
			message : 'Missing or invalid Authorization header. Expected format: Bearer <api_key>'
		});
	}

	const apiKey = authHeader.substring(7);

	if (apiKey !== VALID_API_KEY) {

		/* Return FALSE */
		return _res.status(401).json({
			success : false,
			error   : 'Unauthorized',
			message : 'Invalid API key'
		});
	}

	next();
};

/*
 * Helper Function To Validate Field
 * @param {Object} _field - Field configuration from sweepstake schema
 * @param {*} _value - Value to validate
 * @returns {Object} Validation result with valid boolean and optional error message
 */
const validateField = (_field, _value) => {

	/* Check If Field Is Required */
	if (_field.required && (_value === undefined || _value === null || _value === '')) {

		return {
			valid : false,
			error : `Field '${_field.name}' is required`
		};
	}

	/* If Field Is Not Required And Empty, It's Valid */
	if (!_field.required && (_value === undefined || _value === null || _value === '')) {

		return { valid: true };
	}

	/* Validate By Type */
	switch (_field.type) {

		case 'string':

			if (typeof _value !== 'string') {

				return {
					valid : false,
					error : `Field '${_field.name}' must be a string`
				};
			}

			if (_field.validation) {

				/* Validate Email Format */
				if (_field.validation.format === 'email') {

					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

					if (!emailRegex.test(_value)) {

						return {
							valid : false,
							error : `Field '${_field.name}' must be a valid email address`
						};
					}
				}

				/* Validate Minimum Length */
				if (_field.validation.minLength && _value.length < _field.validation.minLength) {

					return {
						valid : false,
						error : `Field '${_field.name}' must be at least ${_field.validation.minLength} characters`
					};
				}

				/* Validate Maximum Length */
				if (_field.validation.maxLength && _value.length > _field.validation.maxLength) {

					return {
						valid : false,
						error : `Field '${_field.name}' must be at most ${_field.validation.maxLength} characters`
					};
				}
			}

			break;

		case 'number':

			const num = typeof _value === 'string' ? parseFloat(_value) : _value;

			if (isNaN(num)) {

				return {
					valid : false,
					error : `Field '${_field.name}' must be a valid number`
				};
			}

			if (_field.validation) {

				/* Validate Integer */
				if (_field.validation.integer && !Number.isInteger(num)) {

					return {
						valid : false,
						error : `Field '${_field.name}' must be an integer`
					};
				}

				/* Validate Minimum */
				if (_field.validation.min !== undefined && num < _field.validation.min) {

					return {
						valid : false,
						error : `Field '${_field.name}' must be at least ${_field.validation.min}`
					};
				}

				/* Validate Maximum */
				if (_field.validation.max !== undefined && num > _field.validation.max) {

					return {
						valid : false,
						error : `Field '${_field.name}' must be at most ${_field.validation.max}`
					};
				}
			}

			break;

		case 'boolean':

			if (typeof _value !== 'boolean' && _value !== 'true' && _value !== 'false') {

				return {
					valid : false,
					error : `Field '${_field.name}' must be a boolean`
				};
			}

			break;

		case 'options':

			if (!_field.options.includes(_value)) {

				return {
					valid : false,
					error : `Field '${_field.name}' must be one of: ${_field.options.join(', ')}`
				};
			}

			break;
	}

	return { valid: true };
};

/*
 * Endpoint Used To Get Sweepstake Schema
 */
app.get('/api-v1/n8n/sweepstakes/:sweepstakeId/schema', authenticateApiKey, (_req, _res) => {

	const { sweepstakeId } = _req.params;

	const sweepstake = sweepstakes[sweepstakeId];

	if (!sweepstake) {

		/* Return FALSE */
		return _res.status(404).json({
			success : false,
			error   : 'Not Found',
			message : `Sweepstake with ID '${sweepstakeId}' not found`
		});
	}

	/* Return TRUE */
	_res.json({
		success : true,
		...sweepstake
	});
});

/*
 * Endpoint Used To Create Participant
 */
app.post('/api-v1/n8n/participants', authenticateApiKey, (_req, _res) => {

	const { sweepstakeId, data } = _req.body;

	/* Validate Sweepstake ID */
	if (!sweepstakeId) {

		/* Return FALSE */
		return _res.status(400).json({
			success : false,
			error   : 'Bad Request',
			message : 'Missing required field: sweepstakeId'
		});
	}

	/* Validate Data Object */
	if (!data || typeof data !== 'object') {

		/* Return FALSE */
		return _res.status(400).json({
			success : false,
			error   : 'Bad Request',
			message : 'Missing or invalid field: data (must be an object)'
		});
	}

	/* Check If Sweepstake Exists */
	const sweepstake = sweepstakes[sweepstakeId];

	if (!sweepstake) {

		/* Return FALSE */
		return _res.status(404).json({
			success : false,
			error   : 'Not Found',
			message : `Sweepstake with ID '${sweepstakeId}' not found`
		});
	}

	/* Validate All Fields */
	const errors = [];

	for (const field of sweepstake.fields) {

		const value      = data[field.name];
		const validation = validateField(field, value);

		if (!validation.valid) {

			errors.push(validation.error);
		}
	}

	if (errors.length > 0) {

		/* Return FALSE */
		return _res.status(400).json({
			success : false,
			error   : 'Validation Failed',
			message : 'One or more fields failed validation',
			errors  : errors
		});
	}

	/* Check For Duplicate Email */
	const email     = data.email;
	const duplicate = participants.find(_p => _p.sweepstakeId === sweepstakeId && _p.data.email === email);

	if (duplicate) {

		/* Return FALSE */
		return _res.status(409).json({
			success               : false,
			error                 : 'Conflict',
			message               : `A participant with email '${email}' already exists for this sweepstake`,
			existingParticipantId : duplicate.participantId
		});
	}

	/* Create Participant */
	const participantId = `part_${Date.now()}_${Math.random().toString(36).substring(7)}`;
	const entryNumber   = participants.filter(_p => _p.sweepstakeId === sweepstakeId).length + 1;
	const createdAt     = new Date().toISOString();

	const participant = {
		participantId : participantId,
		sweepstakeId  : sweepstakeId,
		entryNumber   : `${sweepstakeId.toUpperCase()}-${entryNumber.toString().padStart(6, '0')}`,
		createdAt     : createdAt,
		data          : data
	};

	participants.push(participant);

	/* Return TRUE */
	_res.status(201).json({
		success : true,
		...participant
	});
});

/*
 * Endpoint Used To Check Server Health
 */
app.get('/health', (_req, _res) => {

	/* Return TRUE */
	_res.json({
		success   : true,
		status    : 'healthy',
		message   : 'Sweeppea Mock API Server is running',
		timestamp : new Date().toISOString()
	});
});

/*
 * Endpoint Used To Debug Participants
 */
app.get('/api-v1/debug/participants', authenticateApiKey, (_req, _res) => {

	/* Return TRUE */
	_res.json({
		success      : true,
		count        : participants.length,
		participants : participants
	});
});

/*
 * Endpoint Used To Debug Sweepstakes
 */
app.get('/api-v1/debug/sweepstakes', authenticateApiKey, (_req, _res) => {

	/* Return TRUE */
	_res.json({
		success      : true,
		count        : Object.keys(sweepstakes).length,
		sweepstakes  : Object.values(sweepstakes)
	});
});

/*
 * Error Handling Middleware
 */
app.use((_err, _req, _res, _next) => {

	console.error('Error:', _err);

	/* Return FALSE */
	_res.status(500).json({
		success : false,
		error   : 'Internal Server Error',
		message : _err.message
	});
});

/*
 * 404 Handler
 */
app.use((_req, _res) => {

	/* Return FALSE */
	_res.status(404).json({
		success : false,
		error   : 'Not Found',
		message : `Endpoint ${_req.method} ${_req.path} not found`
	});
});

/*
 * Start Server
 */
app.listen(PORT, () => {

	console.log(`\n🚀 Sweeppea Mock API Server`);
	console.log(`📡 Running on: http://localhost:${PORT}`);
	console.log(`🔑 Test API Key: ${VALID_API_KEY}`);
	console.log(`\n📚 Available endpoints:`);
	console.log(`   GET  /health`);
	console.log(`   GET  /api-v1/n8n/sweepstakes/:sweepstakeId/schema`);
	console.log(`   POST /api-v1/n8n/participants`);
	console.log(`   GET  /api-v1/debug/participants`);
	console.log(`   GET  /api-v1/debug/sweepstakes`);
	console.log(`\n✨ Ready to accept requests!\n`);
});
