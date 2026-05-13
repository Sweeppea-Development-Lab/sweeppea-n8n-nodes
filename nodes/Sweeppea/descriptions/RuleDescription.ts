/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/descriptions/RuleDescription.ts

	(c) Sweeppea, all rights reserved.
*/

import { INodeProperties } from 'n8n-workflow';

/* Operation Selector For The "Rule" Resource */
export const ruleOperations: INodeProperties[] = [
	{
		displayName      : 'Operation',
		name             : 'operation',
		type             : 'options',
		noDataExpression : true,
		displayOptions   : {
			show: {
				resource: ['rule'],
			},
		},
		options: [
			{
				name        : 'Create',
				value       : 'create',
				description : 'Create an official rules document for a sweepstake',
				action      : 'Create a rule',
			},
		],
		default: 'create',
	},
];

/* Fields For The "Rule" Resource */
export const ruleFields: INodeProperties[] = [
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
				resource: ['rule'],
			},
		},
		default     : '',
		placeholder : '83d12d10-7a6d-4f99-a546-5a1c3cc267f9',
		description : 'The sweepstakes UUID token',
	},
	{
		displayName    : 'Title',
		name           : 'ruleTitle',
		type           : 'string',
		required       : true,
		displayOptions : {
			show: {
				resource  : ['rule'],
				operation : ['create'],
			},
		},
		default     : '',
		placeholder : 'Official Rules',
		description : 'Title of the official rules document (max 100 characters)',
	},
	{
		displayName    : 'Document Content',
		name           : 'ruleDocumentContent',
		type           : 'string',
		typeOptions    : {
			rows: 10,
		},
		required       : true,
		displayOptions : {
			show: {
				resource  : ['rule'],
				operation : ['create'],
			},
		},
		default     : '',
		description : 'Full HTML content of the rules (max 1,000,000 characters)',
	},
];
