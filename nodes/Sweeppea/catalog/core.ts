/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/catalog/core.ts

	(c) Sweeppea, all rights reserved.
*/

import { CatalogResource } from './types';
import { sweepstakeField, tokenField } from './fields';

/* Account — Read-only Information About The Authenticated Account */
export const accountResource: CatalogResource = {
	value            : 'account',
	name             : 'Account',
	defaultOperation : 'getProfile',
	operations       : [
		{
			value       : 'getBusiness',
			name        : 'Get Business Info',
			action      : 'Get business info',
			description : 'Retrieve the business information of the account',
			endpoint    : '/account/business',
		},
		{
			value       : 'getPlan',
			name        : 'Get Plan',
			action      : 'Get plan details',
			description : 'Retrieve the subscription plan with limits, pricing and enabled modules (requires a wildcard API domain)',
			endpoint    : '/account/plan',
		},
		{
			value       : 'getProfile',
			name        : 'Get Profile',
			action      : 'Get profile',
			description : 'Retrieve the profile and status of the authenticated user',
			endpoint    : '/account/profile',
		},
		{
			value       : 'healthCheck',
			name        : 'Health Check',
			action      : 'Check API health',
			description : 'Verify that the API is up and the API key is valid',
			endpoint    : '/account/health-check',
		},
	],
};

/* Group — Participant Groups Inside A Sweepstake */
export const groupResource: CatalogResource = {
	value            : 'group',
	name             : 'Group',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'create',
			name        : 'Create',
			action      : 'Create a group',
			description : 'Create a participant group (names are unique per sweepstake)',
			endpoint    : '/groups/create',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				{ key: 'GroupName', displayName: 'Group Name', type: 'string', required: true, description: 'Unique name inside the sweepstake (max 100 characters)' },
			],
		},
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete a group',
			description : 'Delete an empty group. Primary, locked and non-empty groups cannot be deleted.',
			endpoint    : '/groups/delete',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				{ key: 'GroupToken', displayName: 'Group', type: 'group', required: true, description: 'The group to delete' },
			],
			notFound    : 'Group not found. Please verify the sweepstake and the group.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many groups',
			description : 'List every participant group of a sweepstake',
			endpoint    : '/groups/fetch',
			fields      : [sweepstakeField('SweepstakesToken')],
			list        : true,
		},
		{
			value       : 'update',
			name        : 'Rename',
			action      : 'Rename a group',
			description : 'Rename a participant group',
			endpoint    : '/groups/update',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				{ key: 'GroupToken', displayName: 'Group', type: 'group', required: true, description: 'The group to rename' },
				{ key: 'GroupName', displayName: 'New Name', type: 'string', required: true, description: 'New unique name for the group' },
			],
			notFound    : 'Group not found. Please verify the sweepstake and the group.',
		},
	],
};

/* Reference Data — Lookup Tables And The Built-in Documentation */
export const referenceResource: CatalogResource = {
	value            : 'reference',
	name             : 'Reference Data',
	defaultOperation : 'getTimezones',
	operations       : [
		{
			value       : 'getAreaCodes',
			name        : 'Get Area Codes',
			action      : 'Get US area codes',
			description : 'US telephone area codes with their state and region (max 10 results)',
			endpoint    : '/tools/areacodes',
			listKey     : 'AreaCodes',
			optional    : [{ key: 'search', displayName: 'Search', type: 'string', description: 'Area code, state or region to search for' }],
			optionalLabel: 'Filters',
			list        : true,
		},
		{
			value       : 'getCountries',
			name        : 'Get Countries',
			action      : 'Get countries',
			description : 'Every country with its ISO code',
			endpoint    : '/tools/countries',
			listKey     : 'Countries',
			optional    : [{ key: 'search', displayName: 'Search', type: 'string', description: 'Part of a country name or code' }],
			optionalLabel: 'Filters',
			list        : true,
		},
		{
			value       : 'getDocumentation',
			name        : 'Get Documentation',
			action      : 'Get API documentation',
			description : 'Retrieve Sweeppea documentation articles, useful as context for AI agents',
			endpoint    : '/documentation/fetch',
			optional    : [
				{ key: 'search', displayName: 'Search', type: 'string', description: 'Text to search for in the documentation' },
				{ key: 'page', displayName: 'Page', type: 'number', default: 1, min: 1, description: 'Page number, starting at 1' },
				{ key: 'limit', displayName: 'Page Size', type: 'number', default: 5, min: 1, max: 10, description: 'Articles per page (max 10)' },
			],
			optionalLabel: 'Filters',
		},
		{
			value       : 'getStates',
			name        : 'Get US States',
			action      : 'Get US states',
			description : 'Every US state with its code',
			endpoint    : '/tools/states',
			listKey     : 'States',
			list        : true,
		},
		{
			value       : 'getTimezones',
			name        : 'Get Timezones',
			action      : 'Get timezones',
			description : 'Every supported timezone with its ID (used by scheduled drawings)',
			endpoint    : '/tools/timezones',
			listKey     : 'Timezones',
			list        : true,
		},
		{
			value       : 'getZipCodes',
			name        : 'Get Zip Codes',
			action      : 'Get US zip codes',
			description : 'Search US zip code data',
			endpoint    : '/tools/zipcodes',
			listKey     : 'ZipCodes',
			fields      : [{ key: 'search', displayName: 'Search', type: 'string', required: true, placeholder: '33101', description: 'Zip code or city to search for (max 10 results)' }],
			list        : true,
		},
	],
};

/* Sweepstake — Operations Added On Top Of The v0.2 Ones */
export const sweepstakeExtension: CatalogResource = {
	value            : 'sweepstake',
	name             : 'Sweepstake',
	defaultOperation : 'getMany',
	extendsExisting  : true,
	operations       : [
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete a sweepstake',
			description : 'Permanently delete a sweepstake and ALL its data (participants, pages, rules, groups, codes). Cannot be undone.',
			endpoint    : '/sweepstakes/delete',
			fields      : [sweepstakeField('SweepstakesToken')],
		},
	],
};

/* Winner — Scheduled Drawings */
export const winnerExtension: CatalogResource = {
	value            : 'winner',
	name             : 'Winner',
	defaultOperation : 'draw',
	extendsExisting  : true,
	operations       : [
		{
			value       : 'deleteScheduled',
			name        : 'Delete Scheduled Drawing',
			action      : 'Delete a scheduled drawing',
			description : 'Cancel and delete a scheduled winner drawing',
			endpoint    : '/winners/deletescheduled',
			method      : 'DELETE',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				tokenField('ScheduleToken', 'Schedule Token', 'Token of the scheduled drawing (from "Get Scheduled Drawings")'),
			],
			notFound    : 'Scheduled drawing not found.',
		},
		{
			value       : 'getScheduled',
			name        : 'Get Scheduled Drawings',
			action      : 'Get scheduled drawings',
			description : 'List the scheduled drawings of a sweepstake',
			endpoint    : '/winners/fetchscheduled',
			fields      : [sweepstakeField('SweepstakesToken')],
			list        : true,
		},
		{
			value       : 'schedule',
			name        : 'Schedule Drawing',
			action      : 'Schedule a drawing',
			description : 'Schedule an automatic winner drawing, optionally recurring',
			endpoint    : '/winners/schedule',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				{ key: 'Group', displayName: 'Group', type: 'groupOrAll', required: true, description: 'Draw from every group or from one group' },
				{ key: 'HowManyWinnersToPick', displayName: 'How Many Winners', type: 'number', required: true, default: 1, min: 1, description: 'Number of winners per drawing' },
				{
					key         : 'SelectedAction',
					displayName : 'Action',
					type        : 'options',
					required    : true,
					default     : 1,
					options     : [
						{ name: 'Draw Only', value: 1 },
						{ name: 'Draw and Notify Winners', value: 2 },
					],
					description : 'What happens when the drawing runs',
				},
				{
					key         : 'ScheduleMode',
					displayName : 'Schedule Mode',
					type        : 'options',
					required    : true,
					default     : 'schedule',
					options     : [
						{ name: 'Specific Date and Time', value: 'schedule' },
						{ name: 'Time Period', value: 'settime' },
					],
					description : 'Run once at a specific date and time, or over a time period',
				},
				{ key: 'EndDate', displayName: 'End Date', type: 'date', required: true, description: 'Date of the drawing (YYYY-MM-DD)' },
				{ key: 'EndTime', displayName: 'End Time', type: 'string', required: true, placeholder: '18:00', description: 'Time of the drawing (HH:mm, 24-hour clock)' },
				{ key: 'Timezone', displayName: 'Timezone', type: 'timezone', required: true, description: 'Timezone of the date and time. Choose from the list, or specify a timezone ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.' },
			],
			optional    : [
				{ key: 'AddDrawingToCalendar', displayName: 'Add to Calendar', type: 'boolean', default: false, description: 'Whether to add the drawing to the Sweeppea calendar' },
				{ key: 'DeliveryTime', displayName: 'Delivery Time', type: 'string', placeholder: '18:00', description: 'Delivery time for the Time Period mode (HH:mm)' },
				{ key: 'DayOfTheWeek', displayName: 'Day of the Week', type: 'number', default: 1, min: 1, max: 7, description: '1 = Sunday … 7 = Saturday (weekly frequency)' },
				{ key: 'DoNotIncludeSpamParticipants', displayName: 'Exclude Spam Participants', type: 'boolean', default: true, description: 'Whether to exclude participants flagged as spam' },
				{
					key         : 'Frequency',
					displayName : 'Frequency',
					type        : 'options',
					default     : 0,
					options     : [
						{ name: 'Daily', value: 2 },
						{ name: 'Hourly', value: 1 },
						{ name: 'Monthly', value: 4 },
						{ name: 'None', value: 0 },
						{ name: 'Weekly', value: 3 },
					],
					description : 'Repeat the drawing',
				},
				{ key: 'IncludeOptedOutParticipants', displayName: 'Include Opted-Out Participants', type: 'boolean', default: false, description: 'Whether opted-out participants can win' },
				{ key: 'Message', displayName: 'Message', type: 'multiline', description: 'Message attached to the drawing' },
				{ key: 'PublishToWinnersPage', displayName: 'Publish to Winners Page', type: 'boolean', default: false, description: 'Whether to publish the winners on the public winners page' },
				{ key: 'SendCopyToMe', displayName: 'Send Copy to Me', type: 'boolean', default: false, description: 'Whether to email you a copy of the results' },
				{ key: 'WeekOfTheMonth', displayName: 'Week of the Month', type: 'number', default: 1, min: 1, max: 4, description: 'Week of the month (monthly frequency)' },
			],
		},
	],
};

/* Rule — Official Rules Documents Beyond "Create" */
export const ruleExtension: CatalogResource = {
	value            : 'rule',
	name             : 'Rule',
	defaultOperation : 'create',
	extendsExisting  : true,
	operations       : [
		{
			value       : 'createWizard',
			name        : 'Create With Wizard',
			action      : 'Create rules with the wizard',
			description : 'Generate official rules from the structured 14-step wizard answers',
			endpoint    : '/rules/createWizard',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				{
					key         : 'WizardData',
					displayName : 'Wizard Answers (JSON)',
					type        : 'json',
					required    : true,
					spread      : true,
					default     : '{}',
					description : 'Wizard answers as a flat object with PascalCase keys (the same payload the Sweeppea MCP sends). The node does NOT run the legal guardrails of the MCP (AMOE, minimum age, alcohol 21+): review the answers before running.',
				},
			],
			optional    : [{ key: 'Title', displayName: 'Title', type: 'string', description: 'Title of the generated rules document' }],
		},
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete a rules document',
			description : 'Permanently delete a rules document. Cannot be undone.',
			endpoint    : '/rules/delete',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				tokenField('RulesToken', 'Rules Token', 'Token of the rules document'),
			],
			notFound    : 'Rules document not found.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many rules documents',
			description : 'List the rules documents of a sweepstake',
			endpoint    : '/rules/fetch',
			listKey     : ['PrimaryRule', 'SecondaryRules'],
			fields      : [sweepstakeField('SweepstakesToken')],
			list        : true,
		},
		{
			value       : 'update',
			name        : 'Update',
			action      : 'Update a rules document',
			description : 'Change the title or the HTML content of a rules document',
			endpoint    : '/rules/update',
			method      : 'PUT',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				tokenField('RulesToken', 'Rules Token', 'Token of the rules document'),
			],
			optional    : [
				{ key: 'AbbreviatedRulesForShopify', displayName: 'Abbreviated Rules for Shopify', type: 'multiline', description: 'Short version of the rules shown by the Shopify app' },
				{ key: 'DocumentContent', displayName: 'Document Content (HTML)', type: 'multiline', description: 'HTML content of the rules (max 1,000,000 characters)' },
				{ key: 'Title', displayName: 'Title', type: 'string', description: 'Max 100 characters' },
			],
			optionalLabel: 'Update Fields',
			notFound    : 'Rules document not found.',
		},
	],
};
