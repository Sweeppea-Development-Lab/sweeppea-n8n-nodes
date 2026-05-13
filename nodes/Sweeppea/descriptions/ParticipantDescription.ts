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
				name        : 'Create',
				value       : 'create',
				description : 'Create a new participant in a sweepstake',
				action      : 'Create a participant',
			},
			{
				name        : 'Get Form Fields',
				value       : 'getFormFields',
				description : 'Get the entry form fields for a sweepstake',
				action      : 'Get sweepstake form fields',
			},
		],
		default: 'create',
	},
];

/* Shared Fields For Every Participant Operation */
export const participantFields: INodeProperties[] = [
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
				resource  : ['participant'],
				operation : ['create', 'getFormFields'],
			},
		},
		default     : '',
		placeholder : '83d12d10-7a6d-4f99-a546-5a1c3cc267f9',
		description : 'The sweepstakes UUID token',
	},
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
];
