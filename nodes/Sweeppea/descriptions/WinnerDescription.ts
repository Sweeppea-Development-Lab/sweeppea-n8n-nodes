/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/descriptions/WinnerDescription.ts

	(c) Sweeppea, all rights reserved.
*/

import { INodeProperties } from 'n8n-workflow';

/* Operation Selector For The "Winner" Resource */
export const winnerOperations: INodeProperties[] = [
	{
		displayName      : 'Operation',
		name             : 'operation',
		type             : 'options',
		noDataExpression : true,
		displayOptions   : {
			show: {
				resource: ['winner'],
			},
		},
		options: [
			{
				name        : 'Draw',
				value       : 'draw',
				description : 'Draw winners from a sweepstake using weighted random selection',
				action      : 'Draw winners',
			},
			{
				name        : 'Get Many',
				value       : 'getMany',
				description : 'Fetch winners previously drawn from a sweepstake',
				action      : 'Get many winners',
			},
		],
		default: 'getMany',
	},
];

/* Fields For The "Winner" Resource */
export const winnerFields: INodeProperties[] = [

	/* Sweepstakes Token — Shared By Every Winner Operation */
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
				resource: ['winner'],
			},
		},
		default     : '',
		placeholder : '83d12d10-7a6d-4f99-a546-5a1c3cc267f9',
		description : 'The sweepstakes UUID token',
	},

	/* "Draw" Operation Fields */
	{
		displayName    : 'How Many Winners',
		name           : 'howManyWinnersToPick',
		type           : 'number',
		typeOptions    : {
			minValue: 1,
		},
		displayOptions : {
			show: {
				resource  : ['winner'],
				operation : ['draw'],
			},
		},
		default     : 1,
		description : 'Number of winners to select in this draw',
	},
	{
		displayName    : 'Additional Fields',
		name           : 'drawAdditionalFields',
		type           : 'collection',
		placeholder    : 'Add Field',
		default        : {},
		displayOptions : {
			show: {
				resource  : ['winner'],
				operation : ['draw'],
			},
		},
		options: [
			{
				displayName : 'Completed Entries Only',
				name        : 'completedEntries',
				type        : 'boolean',
				default     : false,
				description : 'Whether to only include participants who completed all bonus entry steps',
			},
			{
				displayName : 'Exclude Spam Participants',
				name        : 'doNotIncludeSpamParticipants',
				type        : 'boolean',
				default     : false,
				description : 'Whether to exclude participants flagged as spam',
			},
			{
				displayName : 'Group',
				name        : 'group',
				type        : 'string',
				default     : 'allgroups',
				description : 'Group token to limit the draw, or "allgroups" to include all participants',
			},
			{
				displayName : 'Include Opted-Out Participants',
				name        : 'includeOptedOutParticipants',
				type        : 'boolean',
				default     : false,
				description : 'Whether to include participants who opted out of notifications',
			},
		],
	},

	/* "Get Many" Operation Fields */
	{
		displayName    : 'Return All',
		name           : 'returnAll',
		type           : 'boolean',
		displayOptions : {
			show: {
				resource  : ['winner'],
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
				resource  : ['winner'],
				operation : ['getMany'],
				returnAll : [false],
			},
		},
		default     : 50,
		description : 'Max number of results to return',
	},
	{
		displayName    : 'Filters',
		name           : 'winnerFilters',
		type           : 'collection',
		placeholder    : 'Add Filter',
		default        : {},
		displayOptions : {
			show: {
				resource  : ['winner'],
				operation : ['getMany'],
			},
		},
		options: [
			{
				displayName : 'Search',
				name        : 'search',
				type        : 'string',
				default     : '',
				description : 'Search term to filter winners by email or phone number',
			},
		],
	},
];
