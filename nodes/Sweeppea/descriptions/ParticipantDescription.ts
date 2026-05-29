/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/descriptions/ParticipantDescription.ts

	(c) Sweeppea, all rights reserved.
*/

import { INodeProperties } from 'n8n-workflow';

/* Operation Selector For The "Participant" Resource */
export const participantOperations: INodeProperties[] = [
	{
		displayName      : 'Operation',
		name             : 'operation',
		type             : 'options',
		noDataExpression : true,
		displayOptions   : {
			show: {
				resource: ['participant'],
			},
		},
		options: [
			{
				name        : 'Count',
				value       : 'count',
				description : 'Count participants in a sweepstake with optional filters',
				action      : 'Count participants',
			},
			{
				name        : 'Create',
				value       : 'create',
				description : 'Create a new participant in a sweepstake',
				action      : 'Create a participant',
			},
			{
				name        : 'Delete',
				value       : 'delete',
				description : 'Delete a participant from a sweepstake',
				action      : 'Delete a participant',
			},
			{
				name        : 'Get',
				value       : 'get',
				description : 'Fetch a single participant by token, email or phone',
				action      : 'Get a participant',
			},
			{
				name        : 'Get Form Fields',
				value       : 'getFormFields',
				description : 'Get the entry form fields for a sweepstake',
				action      : 'Get sweepstake form fields',
			},
			{
				name        : 'Get Many',
				value       : 'getMany',
				description : 'Fetch many participants from a sweepstake',
				action      : 'Get many participants',
			},
		],
		default: 'create',
	},
];

/* Shared Fields For Every Participant Operation */
export const participantFields: INodeProperties[] = [

	/* Sweepstakes Token Is Required For Every Participant Operation */
	{
		displayName    : 'Sweepstakes Token',
		name           : 'sweepstakesToken',
		type           : 'string',
		typeOptions    : {
			password: true,
		},
		required       : true,
		displayOptions : {
			show: {
				resource: ['participant'],
			},
		},
		default     : '',
		placeholder : '83d12d10-7a6d-4f99-a546-5a1c3cc267f9',
		description : 'The sweepstakes UUID token',
	},

	/* "Create" + "Get Form Fields" — Keep The Original Additional Fields Collection */
	{
		displayName    : 'Additional Fields',
		name           : 'additionalFields',
		type           : 'collection',
		placeholder    : 'Add Field',
		default        : {},
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['create', 'getFormFields'],
			},
		},
		options: [
			{
				displayName : 'Use Input Data',
				name        : 'useInputData',
				type        : 'boolean',
				default     : true,
				description : 'Whether to use all data from the input item as participant data',
			},
		],
	},

	/*
	 * "Create" Operation — Explicit Participant Body Inputs
	 * Exposed As Top-Level Node Parameters So The AI Agent Can Fill
	 * Them Via $fromAI() When This Node Runs As A Tool. When Empty,
	 * Falls Back To items[i].json (v0.1 Compat)
	 */
	{
		displayName    : 'Email',
		name           : 'KeyEmail',
		type           : 'string',
		default        : '',
		placeholder    : 'name@example.com',
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['create'],
			},
		},
		description : 'Participant email address. Leave empty to read from the input item\'s "KeyEmail" field.',
	},
	{
		displayName    : 'Phone Number',
		name           : 'KeyPhoneNumber',
		type           : 'string',
		default        : '',
		placeholder    : '5551234567',
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['create'],
			},
		},
		description : '10-digit US phone (NANP), no separators. Leave empty to read from the input item\'s "KeyPhoneNumber" field.',
	},
	{
		displayName    : 'Bonus Entries',
		name           : 'BonusEntries',
		type           : 'number',
		default        : 0,
		typeOptions    : {
			minValue: 0,
		},
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['create'],
			},
		},
		description : 'Number of additional sweepstake entries to award. Defaults to 0; falls back to the input item\'s "BonusEntries" field when zero.',
	},
	{
		displayName    : 'Custom Fields',
		name           : 'CustomFields',
		type           : 'json',
		default        : '{}',
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['create'],
			},
		},
		description : 'Entry-page custom fields as a JSON object. Keys use underscores (e.g. {"First_Name":"Mauro","Last_Name":"H"}). Leave as "{}" to read from the input item\'s "Fields" field.',
	},
	{
		displayName    : 'Create Options',
		name           : 'createOptions',
		type           : 'collection',
		placeholder    : 'Add Option',
		default        : {},
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['create'],
			},
		},
		options: [
			{
				displayName : 'Language',
				name        : 'lang',
				type        : 'string',
				default     : 'EN',
				description : 'Participant language code (ISO 639-1). Defaults to "EN".',
			},
			{
				displayName : 'Source',
				name        : 'source',
				type        : 'string',
				default     : 'n8n-integration',
				description : 'Tag identifying where the participant came from. Defaults to "n8n-integration".',
			},
		],
	},

	/* "Get" Operation — Pick A Search Field And Provide Its Value */
	{
		displayName      : 'Search By',
		name             : 'searchBy',
		type             : 'options',
		noDataExpression : true,
		displayOptions   : {
			show: {
				resource  : ['participant'],
				operation : ['get'],
			},
		},
		options: [
			{
				name  : 'Email',
				value : 'keyEmail',
			},
			{
				name  : 'Participant Token',
				value : 'participantToken',
			},
			{
				name  : 'Phone Number',
				value : 'keyPhoneNumber',
			},
		],
		default     : 'keyEmail',
		description : 'Which identifier to search the participant by',
	},
	{
		displayName    : 'Email',
		name           : 'getKeyEmail',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['get'],
				searchBy  : ['keyEmail'],
			},
		},
		default     : '',
		placeholder : 'name@example.com',
		description : 'Email address of the participant to fetch',
	},
	{
		displayName    : 'Phone Number',
		name           : 'getKeyPhoneNumber',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['get'],
				searchBy  : ['keyPhoneNumber'],
			},
		},
		default     : '',
		placeholder : '5551234567',
		description : 'Phone number (10 digits, no separators) of the participant to fetch',
	},
	{
		displayName    : 'Participant Token',
		name           : 'getParticipantToken',
		type           : 'string',
		typeOptions: { password: true },
		required       : true,
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['get'],
				searchBy  : ['participantToken'],
			},
		},
		default     : '',
		placeholder : 'uuid-v4-string',
		description : 'Participant Token (UUID v4) of the participant to fetch',
	},

	/* "Delete" Operation — Requires Participant Token */
	{
		displayName    : 'Participant Token',
		name           : 'deleteParticipantToken',
		type           : 'string',
		typeOptions: { password: true },
		required       : true,
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['delete'],
			},
		},
		default     : '',
		placeholder : 'uuid-v4-string',
		description : 'Participant Token (UUID v4) of the participant to delete',
	},

	/* "Get Many" Operation — Pagination + Filters */
	{
		displayName    : 'Return All',
		name           : 'returnAll',
		type           : 'boolean',
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['getMany'],
			},
		},
		default     : false,
		description : 'Whether to return all results or only up to a given limit',
	},
	{
		displayName    : 'Limit',
		name           : 'limit',
		type           : 'number',
		typeOptions    : {
			minValue: 1,
		},
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['getMany'],
				returnAll : [false],
			},
		},
		default     : 50,
		description : 'Max number of results to return',
	},
	{
		displayName    : 'Filters',
		name           : 'getManyFilters',
		type           : 'collection',
		placeholder    : 'Add Filter',
		default        : {},
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['getMany'],
			},
		},
		options: [
			{
				displayName : 'End Date',
				name        : 'endDate',
				type        : 'string',
				default     : '',
				placeholder : '2025-12-31',
				description : 'End date (YYYY-MM-DD) for the creation date filter; requires Start Date',
			},
			{
				displayName : 'Opt-In Date',
				name        : 'optInDate',
				type        : 'string',
				default     : '',
				placeholder : '2025-06-15',
				description : 'Filter participants by a specific opt-in date (YYYY-MM-DD)',
			},
			{
				displayName : 'Search',
				name        : 'search',
				type        : 'string',
				default     : '',
				description : 'Search term to filter by first name, last name, email or phone number (case-insensitive)',
			},
			{
				displayName : 'Start Date',
				name        : 'startDate',
				type        : 'string',
				default     : '',
				placeholder : '2025-01-01',
				description : 'Start date (YYYY-MM-DD) for the creation date filter; requires End Date',
			},
		],
	},

	/* "Count" Operation — Filter Type + Optional Date Range */
	{
		displayName      : 'Filter Type',
		name             : 'countFilterType',
		type             : 'options',
		noDataExpression : true,
		displayOptions   : {
			show: {
				resource  : ['participant'],
				operation : ['count'],
			},
		},
		options: [
			{
				name  : 'All',
				value : 'all',
			},
			{
				name  : 'AMOE Participants',
				value : 'amoe',
			},
			{
				name  : 'Opt-Outs',
				value : 'optouts',
			},
			{
				name  : 'Participants',
				value : 'participants',
			},
		],
		default     : 'all',
		description : 'Which subset of participants to count',
	},
	{
		displayName    : 'Date Range',
		name           : 'countDateRange',
		type           : 'collection',
		placeholder    : 'Add Date',
		default        : {},
		displayOptions : {
			show: {
				resource  : ['participant'],
				operation : ['count'],
			},
		},
		options: [
			{
				displayName : 'End Date',
				name        : 'endDate',
				type        : 'string',
				default     : '',
				placeholder : '2025-12-31',
				description : 'End date (YYYY-MM-DD) for the count range',
			},
			{
				displayName : 'Start Date',
				name        : 'startDate',
				type        : 'string',
				default     : '',
				placeholder : '2025-01-01',
				description : 'Start date (YYYY-MM-DD) for the count range',
			},
		],
	},
];
