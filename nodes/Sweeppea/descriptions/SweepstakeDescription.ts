/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/descriptions/SweepstakeDescription.ts

	(c) Sweeppea, all rights reserved.
*/

import { INodeProperties } from 'n8n-workflow';

/* Operation Selector For The "Sweepstake" Resource */
export const sweepstakeOperations: INodeProperties[] = [
	{
		displayName      : 'Operation',
		name             : 'operation',
		type             : 'options',
		noDataExpression : true,
		displayOptions   : {
			show: {
				resource: ['sweepstake'],
			},
		},
		options: [
			{
				name        : 'Clone',
				value       : 'clone',
				description : 'Duplicate an existing sweepstake with new dates and handler',
				action      : 'Clone a sweepstake',
			},
			{
				name        : 'Create',
				value       : 'create',
				description : 'Create a new sweepstake',
				action      : 'Create a sweepstake',
			},
			{
				name        : 'Get Many',
				value       : 'getMany',
				description : 'Fetch all sweepstakes for the authenticated account',
				action      : 'Get many sweepstakes',
			},
			{
				name        : 'Pause',
				value       : 'pause',
				description : 'Pause an active sweepstake',
				action      : 'Pause a sweepstake',
			},
			{
				name        : 'Unpause',
				value       : 'unpause',
				description : 'Reactivate a paused sweepstake',
				action      : 'Unpause a sweepstake',
			},
			{
				name        : 'Update',
				value       : 'update',
				description : 'Update an existing sweepstake name or dates',
				action      : 'Update a sweepstake',
			},
		],
		default: 'getMany',
	},
];

/* Fields For The "Sweepstake" Resource */
export const sweepstakeFields: INodeProperties[] = [

	/* Sweepstakes Token — Shared By Pause / Unpause / Update */
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
				resource  : ['sweepstake'],
				operation : ['pause', 'unpause', 'update'],
			},
		},
		default     : '',
		placeholder : '83d12d10-7a6d-4f99-a546-5a1c3cc267f9',
		description : 'The sweepstakes UUID token',
	},

	/* "Create" Operation Fields */
	{
		displayName    : 'Name',
		name           : 'sweepstakesName',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['create'],
			},
		},
		default     : '',
		description : 'Display name for the new sweepstake (max 200 characters)',
	},
	{
		displayName      : 'Type',
		name             : 'sweepstakesType',
		type             : 'options',
		noDataExpression : true,
		displayOptions   : {
			show: {
				resource  : ['sweepstake'],
				operation : ['create'],
			},
		},
		options: [
			{
				name  : 'Email',
				value : 2,
			},
			{
				name  : 'SMS',
				value : 1,
			},
			{
				name  : 'Social',
				value : 3,
			},
		],
		default     : 2,
		description : 'Primary channel for collecting entries',
	},
	{
		displayName    : 'Handler',
		name           : 'handler',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['create'],
			},
		},
		default     : '',
		placeholder : 'WIN2026',
		description : 'Unique keyword (max 20 chars, alphanumeric only, auto-uppercased)',
	},
	{
		displayName    : 'Start Date',
		name           : 'startDate',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['create'],
			},
		},
		default     : '',
		placeholder : '2026-06-01',
		description : 'Start date in YYYY-MM-DD format (today or future)',
	},
	{
		displayName    : 'End Date',
		name           : 'endDate',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['create'],
			},
		},
		default     : '',
		placeholder : '2026-08-31',
		description : 'End date in YYYY-MM-DD format (today or future, on or after Start Date)',
	},
	{
		displayName    : 'Start Time',
		name           : 'startTime',
		type           : 'string',
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['create'],
			},
		},
		default     : '00:00',
		placeholder : '00:00',
		description : 'Daily start time in HH:MM 24-hour format',
	},
	{
		displayName    : 'End Time',
		name           : 'endTime',
		type           : 'string',
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['create'],
			},
		},
		default     : '23:59',
		placeholder : '23:59',
		description : 'Daily end time in HH:MM 24-hour format',
	},
	{
		displayName    : 'Additional Fields',
		name           : 'createAdditionalFields',
		type           : 'collection',
		placeholder    : 'Add Field',
		default        : {},
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['create'],
			},
		},
		options: [
			{
				displayName : 'Create In Calendar',
				name        : 'CreateInCalendar',
				type        : 'boolean',
				default     : false,
				description : 'Whether to create START and END calendar events for the sweepstake',
			},
			{
				displayName : 'Delete If Account Deleted',
				name        : 'DeleteIfAcctDeleted',
				type        : 'boolean',
				default     : false,
				description : 'Whether to delete from Winners APP if the user account is deleted',
			},
			{
				displayName : 'Delete If Deleted',
				name        : 'DeleteIfDeleted',
				type        : 'boolean',
				default     : false,
				description : 'Whether to delete from Winners APP if the sweepstake is deleted',
			},
			{
				displayName : 'Sync With Winners',
				name        : 'SyncWithWinners',
				type        : 'boolean',
				default     : false,
				description : 'Whether to sync the sweepstake with the Winners APP',
			},
		],
	},

	/* "Update" Operation Fields */
	{
		displayName    : 'Update Fields',
		name           : 'updateFields',
		type           : 'collection',
		placeholder    : 'Add Field',
		default        : {},
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['update'],
			},
		},
		options: [
			{
				displayName : 'End Date',
				name        : 'EndDate',
				type        : 'string',
				default     : '',
				placeholder : '2026-08-31',
				description : 'New end date in YYYY-MM-DD format',
			},
			{
				displayName : 'End Time',
				name        : 'EndTime',
				type        : 'string',
				default     : '',
				placeholder : '23:59',
				description : 'New end time in HH:MM 24-hour format',
			},
			{
				displayName : 'Name',
				name        : 'SweepstakesName',
				type        : 'string',
				default     : '',
				description : 'New display name for the sweepstake (max 200 characters)',
			},
			{
				displayName : 'Start Date',
				name        : 'StartDate',
				type        : 'string',
				default     : '',
				placeholder : '2026-06-01',
				description : 'New start date in YYYY-MM-DD format',
			},
			{
				displayName : 'Start Time',
				name        : 'StartTime',
				type        : 'string',
				default     : '',
				placeholder : '00:00',
				description : 'New start time in HH:MM 24-hour format',
			},
		],
	},

	/* "Clone" Operation Fields */
	{
		displayName    : 'Source Handler',
		name           : 'cloneSourceHandler',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['clone'],
			},
		},
		default     : '',
		placeholder : 'WIN2026',
		description : 'Handler of the existing sweepstake to clone',
	},
	{
		displayName    : 'New Handler',
		name           : 'cloneNewHandler',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['clone'],
			},
		},
		default     : '',
		placeholder : 'WIN2027',
		description : 'Handler for the cloned sweepstake (max 20 chars, alphanumeric, must be unique)',
	},
	{
		displayName    : 'New Name',
		name           : 'cloneNewName',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['clone'],
			},
		},
		default     : '',
		description : 'Display name for the cloned sweepstake',
	},
	{
		displayName    : 'Start Date',
		name           : 'cloneStartDate',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['clone'],
			},
		},
		default     : '',
		placeholder : '2026-06-01',
		description : 'Start date for the cloned sweepstake in YYYY-MM-DD format',
	},
	{
		displayName    : 'End Date',
		name           : 'cloneEndDate',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['clone'],
			},
		},
		default     : '',
		placeholder : '2026-08-31',
		description : 'End date for the cloned sweepstake in YYYY-MM-DD format',
	},
	{
		displayName    : 'Start Time',
		name           : 'cloneStartTime',
		type           : 'string',
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['clone'],
			},
		},
		default     : '00:00',
		placeholder : '00:00',
		description : 'Daily start time for the cloned sweepstake in HH:MM 24-hour format',
	},
	{
		displayName    : 'End Time',
		name           : 'cloneEndTime',
		type           : 'string',
		displayOptions : {
			show: {
				resource  : ['sweepstake'],
				operation : ['clone'],
			},
		},
		default     : '23:59',
		placeholder : '23:59',
		description : 'Daily end time for the cloned sweepstake in HH:MM 24-hour format',
	},
];
