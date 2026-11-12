/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/catalog/engagement.ts

	(c) Sweeppea, all rights reserved.
*/

import { CatalogField, CatalogResource } from './types';

import {
	emailOrSmsOptions,
	emailSmsOrBothOptions,
	idempotencyKeyField,
	PAGE_ITEMS_PER_PAGE_100,
	sweepstakeField,
	tokenField,
} from './fields';

/* Shared Attributes Of A Code (Create / Generate / Update) */
const codeAttributes: CatalogField[] = [
	{ key: 'Description', displayName: 'Description', type: 'multiline', description: 'Applied to every code (max 5,000 characters)' },
	{ key: 'ExpirationDate', displayName: 'Expiration Date', type: 'date', description: 'YYYY-MM-DD, not in the past' },
	{ key: 'ExpirationTime', displayName: 'Expiration Time', type: 'string', placeholder: '23:59', description: 'HH:mm, 24-hour clock' },
	{ key: 'ExternalURL', displayName: 'External URL', type: 'string', placeholder: 'https://shop.example.com/redeem', description: 'https:// link applied to every code (max 500 characters)' },
	{ key: 'Value', displayName: 'Value', type: 'string', placeholder: '$10', description: 'Displayed value, max 10 characters (e.g. $10, 15%)' },
];

const couponTokenField = tokenField('CouponToken', 'Coupon Token', 'Token of the code');

/* Code — Codes & Coupons (POS Integration, Prize Codes, Discounts) */
export const codeResource: CatalogResource = {
	value            : 'code',
	name             : 'Code',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'assign',
			name        : 'Assign',
			action      : 'Assign a code to a participant',
			description : 'Assign one available code to a participant of the same sweepstake who holds no code yet',
			endpoint    : '/codes/assign',
			fields      : [couponTokenField, tokenField('ParticipantToken', 'Participant Token', 'Token of the participant (regular or AMOE)')],
		},
		{
			value       : 'create',
			name        : 'Create',
			action      : 'Create codes',
			description : 'Import 1 to 1,000 existing codes (from a POS, a CRM or a printed batch)',
			endpoint    : '/codes/create',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				{ key: 'Codes', displayName: 'Codes', type: 'stringList', required: true, placeholder: 'SUMMER-001, SUMMER-002', description: 'Codes to import: up to 20 letters, digits, - or _ each. Separate them with commas or new lines.' },
			],
			optional    : codeAttributes,
		},
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete codes',
			description : 'Delete 1 to 1,000 codes nobody holds yet. Assigned, redeemed and voided codes are skipped.',
			endpoint    : '/codes/delete',
			fields      : [
				{ key: 'CouponTokens', displayName: 'Coupon Tokens', type: 'stringList', required: true, description: 'Tokens of the codes to delete. Separate them with commas or new lines.' },
			],
		},
		{
			value       : 'generate',
			name        : 'Generate',
			action      : 'Generate codes',
			description : 'Generate 1 to 5,000 unique random codes',
			endpoint    : '/codes/generate',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				{ key: 'Quantity', displayName: 'Quantity', type: 'number', required: true, default: 10, min: 1, max: 5000, description: 'How many codes to generate' },
				{ key: 'Length', displayName: 'Length', type: 'number', required: true, default: 8, min: 4, max: 20, description: 'Random characters per code. Prefix + Length + Suffix must not exceed 20.' },
			],
			optional    : [
				{
					key         : 'Case',
					displayName : 'Case',
					type        : 'options',
					default     : 'upper',
					options     : [
						{ name: 'Lower', value: 'lower' },
						{ name: 'Mixed', value: 'mixed' },
						{ name: 'Upper', value: 'upper' },
					],
					description : 'Letter case (alphanumeric codes only)',
				},
				...codeAttributes,
				{ key: 'Prefix', displayName: 'Prefix', type: 'string', description: 'Letters, digits, - or _ placed before every code' },
				{ key: 'Suffix', displayName: 'Suffix', type: 'string', description: 'Letters, digits, - or _ placed after every code' },
				{
					key         : 'Type',
					displayName : 'Character Set',
					type        : 'options',
					default     : 'alphanumeric',
					options     : [
						{ name: 'Alphanumeric', value: 'alphanumeric' },
						{ name: 'Numeric', value: 'numeric' },
					],
					description : 'Characters used in the random part',
				},
			],
		},
		{
			value       : 'get',
			name        : 'Get',
			action      : 'Get a code',
			description : 'Fetch one code by its token, or by the code a customer presented (point of sale)',
			endpoint    : '/codes/single',
			optional    : [
				{ key: 'CouponCode', displayName: 'Coupon Code', type: 'string', description: 'The code itself (requires Sweepstake)' },
				{ key: 'CouponToken', displayName: 'Coupon Token', type: 'string', description: 'Token of the code. Takes precedence over Coupon Code.' },
				{ key: 'SweepstakesToken', displayName: 'Sweepstakes Token', type: 'string', description: 'Required when searching by Coupon Code' },
			],
			optionalLabel: 'Options',
			requireOneOf: ['CouponToken', 'CouponCode'],
			notFound    : 'Code not found.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many codes',
			description : 'List the codes of a sweepstake with the participant each one is assigned to',
			endpoint    : '/codes/fetch',
			fields      : [sweepstakeField('SweepstakesToken')],
			optional    : [
				{
					key         : 'Filter',
					displayName : 'Status',
					type        : 'options',
					default     : 'all',
					options     : [
						{ name: 'All', value: 'all' },
						{ name: 'Assigned', value: 'assigned' },
						{ name: 'Available', value: 'available' },
						{ name: 'Not Redeemed', value: 'not-redeemed' },
						{ name: 'Redeemed', value: 'redeemed' },
						{ name: 'Unassigned', value: 'unassigned' },
						{ name: 'Voided', value: 'voided' },
					],
					description : 'Only codes in this state',
				},
				{ key: 'Search', displayName: 'Search', type: 'string', description: 'Part of a code, or of the email / phone of the assigned participant' },
				{
					key         : 'SortBy',
					displayName : 'Sort By',
					type        : 'options',
					default     : 'CreationDate',
					options     : [
						{ name: 'Code', value: 'CouponCode' },
						{ name: 'Creation Date', value: 'CreationDate' },
						{ name: 'Expiration Date', value: 'ExpirationDate' },
						{ name: 'Redemption Date', value: 'RedemptionDate' },
						{ name: 'Status', value: 'Status' },
					],
				},
				{ key: 'SortDesc', displayName: 'Sort Descending', type: 'boolean', default: true, description: 'Whether to sort in descending order' },
			],
			optionalLabel: 'Filters',
			pagination  : { pageKey: 'Page', sizeKey: 'ItemsPerPage', maxSize: 500 },
		},
		{
			value       : 'getSettings',
			name        : 'Get Settings',
			action      : 'Get code settings',
			description : 'Read how the sweepstake hands out codes on its entry and AMOE pages',
			endpoint    : '/codes/settings',
			fields      : [sweepstakeField('SweepstakesToken')],
		},
		{
			value       : 'getStats',
			name        : 'Get Stats',
			action      : 'Get code statistics',
			description : 'Count total, assigned, unassigned, redeemed, voided and available codes',
			endpoint    : '/codes/stats',
			fields      : [sweepstakeField('SweepstakesToken')],
		},
		{
			value       : 'redeem',
			name        : 'Redeem',
			action      : 'Redeem a code',
			description : 'Mark a code as redeemed (exactly once), by token or by the code a customer presented',
			endpoint    : '/codes/redeem',
			optional    : [
				{ key: 'CouponCode', displayName: 'Coupon Code', type: 'string', description: 'The code itself (requires Sweepstakes Token)' },
				{ key: 'CouponToken', displayName: 'Coupon Token', type: 'string', description: 'Token of the code. Takes precedence over Coupon Code.' },
				{ key: 'SweepstakesToken', displayName: 'Sweepstakes Token', type: 'string', description: 'Required when redeeming by Coupon Code' },
			],
			optionalLabel: 'Options',
			requireOneOf: ['CouponToken', 'CouponCode'],
			notFound    : 'Code not found.',
		},
		{
			value       : 'send',
			name        : 'Send to Participant',
			action      : 'Send a code to its participant',
			description : 'Email and/or text an assigned code to the participant who holds it',
			endpoint    : '/codes/send',
			fields      : [
				couponTokenField,
				{ key: 'Channel', displayName: 'Channel', type: 'options', required: true, default: 'email', options: emailSmsOrBothOptions },
			],
			optional    : [idempotencyKeyField],
		},
		{
			value       : 'unassign',
			name        : 'Unassign',
			action      : 'Unassign a code',
			description : 'Take a code back from its participant (clears any redemption)',
			endpoint    : '/codes/unassign',
			fields      : [couponTokenField],
		},
		{
			value       : 'unredeem',
			name        : 'Unredeem',
			action      : 'Unredeem a code',
			description : 'Reverse a redemption made by mistake (keeps the assignment)',
			endpoint    : '/codes/unredeem',
			fields      : [couponTokenField],
		},
		{
			value       : 'update',
			name        : 'Update',
			action      : 'Update a code',
			description : 'Change the attributes of one code (the code itself only while unassigned)',
			endpoint    : '/codes/update',
			fields      : [couponTokenField],
			optional    : [
				{ key: 'CouponCode', displayName: 'New Code', type: 'string', description: 'Rename the code (only while unassigned and not redeemed)' },
				...codeAttributes,
			],
			optionalLabel: 'Update Fields',
		},
		{
			value       : 'updateSettings',
			name        : 'Update Settings',
			action      : 'Update code settings',
			description : 'Change how the sweepstake hands out codes',
			endpoint    : '/codes/update-settings',
			fields      : [sweepstakeField('SweepstakesToken')],
			optional    : [
				{
					key         : 'CouponAmoePageRegistration',
					displayName : 'AMOE Page Behavior',
					type        : 'options',
					default     : 0,
					options     : [
						{ name: 'Ask for Their Code', value: 3 },
						{ name: 'Assign an Existing Code', value: 1 },
						{ name: 'Generate a New Code', value: 2 },
						{ name: 'None', value: 0 },
					],
				},
				{ key: 'CouponCodeCaseSensitive', displayName: 'Case-sensitive Codes', type: 'boolean', default: false, description: 'Whether codes typed by participants are compared case-sensitively' },
				{ key: 'CouponCodeLength', displayName: 'Generated Code Length', type: 'number', default: 8, min: 4, max: 20 },
				{
					key         : 'CouponCodeType',
					displayName : 'Generated Code Type',
					type        : 'options',
					default     : 2,
					options     : [
						{ name: 'Alphanumeric', value: 2 },
						{ name: 'Numeric', value: 1 },
					],
				},
				{ key: 'CouponRequestFieldLabel', displayName: 'Code Field Label', type: 'string', description: 'Label of the code field when participants type their code' },
				{ key: 'CouponThankYouPageMessage', displayName: 'Thank-you Page Message', type: 'multiline', description: 'Plain text, max 1,000 characters' },
				{
					key         : 'CouponEntryPageRegistration',
					displayName : 'Entry Page Behavior',
					type        : 'options',
					default     : 0,
					options     : [
						{ name: 'Ask for Their Code', value: 3 },
						{ name: 'Assign an Existing Code', value: 1 },
						{ name: 'Generate a New Code', value: 2 },
						{ name: 'None', value: 0 },
					],
				},
				{ key: 'DisplayCouponCodeOnConfirmationPage', displayName: 'Show Code on Confirmation Page', type: 'boolean', default: false, description: 'Whether to show the code on the confirmation page' },
				{ key: 'InvalidCouponCodeErrorMessage', displayName: 'Invalid Code Message', type: 'string', description: 'Message shown when a typed code is invalid' },
				{ key: 'RejectInvalidCouponCode', displayName: 'Reject Invalid Codes', type: 'boolean', default: false, description: 'Whether to refuse the registration when a typed code is invalid' },
				{ key: 'SendCouponCodeToParticipantByEmail', displayName: 'Email the Code', type: 'boolean', default: false, description: 'Whether to email the code to the participant' },
				{ key: 'SendCouponCodeToParticipantBySMS', displayName: 'Text the Code', type: 'boolean', default: false, description: 'Whether to text the code to the participant' },
				{
					key         : 'WhatToDoWhenNoCouponCodeIsAvailable',
					displayName : 'When No Code Is Available',
					type        : 'options',
					default     : 0,
					options     : [
						{ name: 'Do Nothing', value: 0 },
						{ name: 'Generate a New Code', value: 1 },
					],
				},
			],
			optionalLabel: 'Update Fields',
		},
	],
};

/* Message — One-to-one Email / SMS To A Participant, Plus Usage */
export const messageResource: CatalogResource = {
	value            : 'message',
	name             : 'Message',
	defaultOperation : 'send',
	operations       : [
		{
			value       : 'getUsage',
			name        : 'Get Usage',
			action      : 'Get messaging usage',
			description : 'Module access, monthly email and SMS allowance, sender readiness and any sending pause',
			endpoint    : '/messaging/usage',
		},
		{
			value       : 'send',
			name        : 'Send to Participant',
			action      : 'Send a message to a participant',
			description : 'Queue an email and/or SMS to one of your participants (the recipient is a Participant Token, never a free address)',
			endpoint    : '/messaging/send',
			fields      : [
				tokenField('ParticipantToken', 'Participant Token', 'Token of the participant (regular or AMOE)'),
				{ key: 'Channel', displayName: 'Channel', type: 'options', required: true, default: 'email', options: emailSmsOrBothOptions },
				{ key: 'Message', displayName: 'Message', type: 'multiline', required: true, description: 'Plain text. Max 5,000 characters (1,600 when sending by SMS).' },
			],
			optional    : [
				idempotencyKeyField,
				{ key: 'Subject', displayName: 'Email Subject', type: 'string', description: 'Max 200 characters. Defaults to a generic subject.' },
			],
			notFound    : 'Participant not found.',
		},
	],
};

const campaignTokenField = tokenField('CampaignToken', 'Campaign Token', 'Token of the campaign');

/* Messaging Campaign — Read And Control Campaigns Created In The App */
export const campaignResource: CatalogResource = {
	value            : 'campaign',
	name             : 'Messaging Campaign',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'cancel',
			name        : 'Cancel',
			action      : 'Cancel a campaign',
			description : 'Cancel an unfinished campaign and release its held allowance. Cannot be undone.',
			endpoint    : '/messaging/cancel-campaign',
			fields      : [campaignTokenField],
		},
		{
			value       : 'get',
			name        : 'Get',
			action      : 'Get a campaign',
			description : 'One campaign in full: content, audience, sender, counters and allowed actions',
			endpoint    : '/messaging/campaign',
			fields      : [campaignTokenField],
			notFound    : 'Campaign not found.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many campaigns',
			description : 'List email and SMS campaigns, newest first',
			endpoint    : '/messaging/campaigns',
			optional    : [
				{ key: 'Archived', displayName: 'Archived', type: 'boolean', default: false, description: 'Whether to list archived campaigns instead' },
				{
					key         : 'Category',
					displayName : 'Category',
					type        : 'options',
					default     : 'marketing',
					options     : [
						{ name: 'Marketing', value: 'marketing' },
						{ name: 'Referral', value: 'referral' },
						{ name: 'Transactional', value: 'transactional' },
					],
				},
				{ key: 'Channel', displayName: 'Channel', type: 'options', default: 'email', options: emailOrSmsOptions },
				{ key: 'Search', displayName: 'Search', type: 'string', description: 'Part of the campaign name' },
				{
					key         : 'Status',
					displayName : 'Status',
					type        : 'options',
					default     : 'sending',
					options     : [
						{ name: 'Blocked', value: 'blocked' },
						{ name: 'Cancelled', value: 'cancelled' },
						{ name: 'Completed', value: 'completed' },
						{ name: 'Draft', value: 'draft' },
						{ name: 'Failed', value: 'failed' },
						{ name: 'Paused', value: 'paused' },
						{ name: 'Queued', value: 'queued' },
						{ name: 'Scheduled', value: 'scheduled' },
						{ name: 'Sending', value: 'sending' },
					],
				},
				{ key: 'SweepstakesToken', displayName: 'Sweepstakes Token', type: 'string', description: 'Only campaigns of this sweepstake' },
			],
			optionalLabel: 'Filters',
			pagination  : PAGE_ITEMS_PER_PAGE_100,
		},
		{
			value       : 'getRecipients',
			name        : 'Get Recipients',
			action      : 'Get campaign recipients',
			description : 'Who a campaign went to and what happened to each message',
			endpoint    : '/messaging/campaign-recipients',
			fields      : [campaignTokenField],
			optional    : [
				{ key: 'Search', displayName: 'Exact Address', type: 'string', description: 'One exact email address or phone number' },
				{
					key         : 'Status',
					displayName : 'Status',
					type        : 'options',
					default     : 'delivered',
					options     : [
						{ name: 'Bounced', value: 'bounced' },
						{ name: 'Cancelled', value: 'cancelled' },
						{ name: 'Clicked', value: 'clicked' },
						{ name: 'Complained', value: 'complained' },
						{ name: 'Delivered', value: 'delivered' },
						{ name: 'Failed', value: 'failed' },
						{ name: 'Opened', value: 'opened' },
						{ name: 'Queued', value: 'queued' },
						{ name: 'Sending', value: 'sending' },
						{ name: 'Sent', value: 'sent' },
						{ name: 'Suppressed', value: 'suppressed' },
						{ name: 'Unsubscribed', value: 'unsubscribed' },
					],
				},
			],
			optionalLabel: 'Filters',
			pagination  : PAGE_ITEMS_PER_PAGE_100,
		},
		{
			value       : 'getReport',
			name        : 'Get Report',
			action      : 'Get a campaign report',
			description : 'Delivery report: counters, rates, errors, sends per hour and top links',
			endpoint    : '/messaging/campaign-report',
			fields      : [campaignTokenField],
		},
		{
			value       : 'pause',
			name        : 'Pause',
			action      : 'Pause a campaign',
			description : 'Stop a queued or sending campaign',
			endpoint    : '/messaging/pause-campaign',
			fields      : [campaignTokenField],
		},
		{
			value       : 'resume',
			name        : 'Resume',
			action      : 'Resume a campaign',
			description : 'Resume a paused campaign (every blocker is re-checked first)',
			endpoint    : '/messaging/resume-campaign',
			fields      : [campaignTokenField],
		},
	],
};

/* Suppression — The Account's Do-not-contact List */
export const suppressionResource: CatalogResource = {
	value            : 'suppression',
	name             : 'Suppression',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'add',
			name        : 'Add',
			action      : 'Add addresses to the suppression list',
			description : 'Add up to 500 addresses of one channel to the do-not-contact list (idempotent)',
			endpoint    : '/messaging/add-suppressions',
			fields      : [
				{ key: 'Channel', displayName: 'Channel', type: 'options', required: true, default: 'email', options: emailOrSmsOptions },
				{ key: 'Addresses', displayName: 'Addresses', type: 'stringList', required: true, description: 'Email addresses or phone numbers (E.164 or 10-digit US/CA). Separate them with commas or new lines.' },
			],
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many suppressions',
			description : 'List every address that unsubscribed, replied STOP, complained, bounced or was added by you',
			endpoint    : '/messaging/suppressions',
			optional    : [
				{ key: 'Channel', displayName: 'Channel', type: 'options', default: 'email', options: emailOrSmsOptions },
				{ key: 'Search', displayName: 'Exact Address', type: 'string', description: 'One exact email address or phone number' },
			],
			optionalLabel: 'Filters',
			pagination  : PAGE_ITEMS_PER_PAGE_100,
		},
		{
			value       : 'remove',
			name        : 'Remove',
			action      : 'Remove an address from the suppression list',
			description : 'Remove one address you added by hand (a recipient\'s own opt-out is never removable)',
			endpoint    : '/messaging/remove-suppression',
			fields      : [
				{ key: 'Channel', displayName: 'Channel', type: 'options', required: true, default: 'email', options: emailOrSmsOptions },
			],
			optional    : [
				{ key: 'Address', displayName: 'Address', type: 'string', description: 'The email address or phone number' },
				{ key: 'AddressHash', displayName: 'Address Hash', type: 'string', description: 'The 64-character hash from "Get Many". When present, Address is ignored.' },
			],
			optionalLabel: 'Options',
			requireOneOf: ['Address', 'AddressHash'],
		},
	],
};

const dripTokenField = tokenField('DripToken', 'Drip Token', 'Token of the drip campaign');

/* Drip Campaign — Automated Sequences (Created And Edited Only In The App, By Design) */
export const dripResource: CatalogResource = {
	value            : 'drip',
	name             : 'Drip Campaign',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'get',
			name        : 'Get',
			action      : 'Get a drip campaign',
			description : 'One drip in full: every step with its delay and content, audience and settings',
			endpoint    : '/messaging/drip',
			fields      : [dripTokenField],
			notFound    : 'Drip campaign not found.',
		},
		{
			value       : 'getEnrollments',
			name        : 'Get Enrollments',
			action      : 'Get drip enrollments',
			description : 'Contacts enrolled in a drip, where each one is and why anyone left',
			endpoint    : '/messaging/drip-enrollments',
			fields      : [dripTokenField],
			optional    : [
				{ key: 'SourceToken', displayName: 'Contact Token', type: 'string', description: 'Only this contact (a Participant Token, or a lead / subscriber ID)' },
				{
					key         : 'Status',
					displayName : 'Status',
					type        : 'options',
					default     : 'active',
					options     : [
						{ name: 'Active', value: 'active' },
						{ name: 'Completed', value: 'completed' },
						{ name: 'Exited', value: 'exited' },
					],
				},
			],
			optionalLabel: 'Filters',
			pagination  : PAGE_ITEMS_PER_PAGE_100,
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many drip campaigns',
			description : 'List drip campaigns with status, counters and plan allowance',
			endpoint    : '/messaging/drips',
			optional    : [
				{ key: 'Archived', displayName: 'Archived', type: 'boolean', default: false, description: 'Whether to list archived drips instead' },
				{ key: 'Channel', displayName: 'Channel', type: 'options', default: 'email', options: emailOrSmsOptions },
				{ key: 'Search', displayName: 'Search', type: 'string', description: 'Part of the drip name' },
				{
					key         : 'Status',
					displayName : 'Status',
					type        : 'options',
					default     : 'active',
					options     : [
						{ name: 'Active', value: 'active' },
						{ name: 'Blocked', value: 'blocked' },
						{ name: 'Completed', value: 'completed' },
						{ name: 'Draft', value: 'draft' },
						{ name: 'Paused', value: 'paused' },
					],
				},
				{ key: 'SweepstakesToken', displayName: 'Sweepstakes Token', type: 'string', description: 'Only drips of this sweepstake' },
			],
			optionalLabel: 'Filters',
			pagination  : PAGE_ITEMS_PER_PAGE_100,
		},
		{
			value       : 'getReport',
			name        : 'Get Report',
			action      : 'Get a drip report',
			description : 'Statistics per step, in total, day by day, and clicked links',
			endpoint    : '/messaging/drip-report',
			fields      : [dripTokenField],
			optional    : [
				{
					key         : 'Days',
					displayName : 'Activity Window',
					type        : 'options',
					default     : 30,
					options     : [
						{ name: '180 Days', value: 180 },
						{ name: '30 Days', value: 30 },
						{ name: '7 Days', value: 7 },
						{ name: '90 Days', value: 90 },
					],
				},
			],
			optionalLabel: 'Options',
		},
		{
			value       : 'pause',
			name        : 'Pause',
			action      : 'Pause a drip campaign',
			description : 'No new contact is enrolled and no step is sent until resumed',
			endpoint    : '/messaging/pause-drip',
			fields      : [dripTokenField],
		},
		{
			value       : 'removeContact',
			name        : 'Remove Contact',
			action      : 'Remove a contact from a drip',
			description : 'Take one contact out of a drip so it receives no more steps',
			endpoint    : '/messaging/drip-remove-contact',
			fields      : [
				dripTokenField,
				{ key: 'SourceToken', displayName: 'Contact Token', type: 'string', required: true, description: 'A Participant Token, or a lead / subscriber ID' },
			],
		},
		{
			value       : 'resume',
			name        : 'Resume',
			action      : 'Resume a drip campaign',
			description : 'Resume a drip you paused, if nothing changed since',
			endpoint    : '/messaging/resume-drip',
			fields      : [dripTokenField],
		},
	],
};

const surveyTokenField = tokenField('SurveyToken', 'Survey Token', 'Token of the survey');

const surveyQuestionsField: CatalogField = {
	key         : 'Questions',
	displayName : 'Questions (JSON)',
	type        : 'json',
	default     : '[]',
	description : 'Array of questions with PascalCase keys: QuestionText and FieldType (text, textarea, radio, checkbox, select, slider, rating, nps, yesno, date) are required; Page, QuestionDescription, Layout, Required, Options and Settings are optional. Max 5 questions per page, 250 in total.',
};

/* Survey — Surveys Attached To A Sweepstake (Requires The Surveys Module) */
export const surveyResource: CatalogResource = {
	value            : 'survey',
	name             : 'Survey',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'create',
			name        : 'Create',
			action      : 'Create a survey',
			description : 'Create a survey with its whole question set in one call',
			endpoint    : '/surveys/create',
			fields      : [
				sweepstakeField('SweepstakesToken'),
				{ key: 'SurveyName', displayName: 'Survey Name', type: 'string', required: true, description: 'Max 200 characters' },
			],
			optional    : [
				surveyQuestionsField,
				{ key: 'Settings', displayName: 'Settings (JSON)', type: 'json', default: '{}', description: 'Survey settings object' },
				{ key: 'Status', displayName: 'Active', type: 'boolean', default: true, description: 'Whether the survey accepts responses' },
			],
		},
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete a survey',
			description : 'Permanently delete a survey with its questions, responses and statistics. Cannot be undone.',
			endpoint    : '/surveys/delete',
			fields      : [surveyTokenField],
			optional    : [
				{ key: 'Confirm', displayName: 'Confirm Deleting Responses', type: 'boolean', default: false, description: 'Whether to confirm the deletion when the survey already holds responses (required in that case)' },
			],
			optionalLabel: 'Options',
			notFound    : 'Survey not found.',
		},
		{
			value       : 'get',
			name        : 'Get',
			action      : 'Get a survey',
			description : 'One survey with its complete question set',
			endpoint    : '/surveys/single',
			fields      : [surveyTokenField],
			notFound    : 'Survey not found.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many surveys',
			description : 'List surveys with question, page and response counters and their public link',
			endpoint    : '/surveys/fetch',
			optional    : [
				{ key: 'Archived', displayName: 'Archived', type: 'boolean', default: false, description: 'Whether to list archived surveys' },
				{ key: 'Status', displayName: 'Active Only', type: 'boolean', default: true, description: 'Whether to list only active surveys' },
				{ key: 'SweepstakesToken', displayName: 'Sweepstakes Token', type: 'string', description: 'Only surveys of this sweepstake' },
			],
			optionalLabel: 'Filters',
			pagination  : { pageKey: 'Page', sizeKey: 'Limit', maxSize: 200 },
		},
		{
			value       : 'getReport',
			name        : 'Get Report',
			action      : 'Get a survey report',
			description : 'Funnel, completion rate, device breakdown, timeline and per-question distributions',
			endpoint    : '/surveys/report',
			fields      : [surveyTokenField],
			optional    : [{ key: 'TimelineDays', displayName: 'Timeline Days', type: 'number', default: 30, min: 1, max: 365 }],
			optionalLabel: 'Options',
		},
		{
			value       : 'getResponses',
			name        : 'Get Responses',
			action      : 'Get survey responses',
			description : 'Individual answers, newest first',
			endpoint    : '/surveys/responses',
			fields      : [surveyTokenField],
			optional    : [
				{ key: 'Completed', displayName: 'Completed Only', type: 'boolean', default: true, description: 'Whether to return only completed responses' },
				{ key: 'FromDate', displayName: 'From Date', type: 'date' },
				{ key: 'IncludeMetadata', displayName: 'Include Device Metadata', type: 'boolean', default: false, description: 'Whether to include device and IP metadata' },
				{ key: 'ToDate', displayName: 'To Date', type: 'date' },
			],
			optionalLabel: 'Filters',
			pagination  : { pageKey: 'Page', sizeKey: 'Limit', maxSize: 100 },
		},
		{
			value       : 'update',
			name        : 'Update',
			action      : 'Update a survey',
			description : 'Rename, (de)activate or archive a survey. Questions can be replaced only while it has no responses.',
			endpoint    : '/surveys/update',
			fields      : [surveyTokenField],
			optional    : [
				{ key: 'Archived', displayName: 'Archived', type: 'boolean', default: false, description: 'Whether the survey is archived' },
				surveyQuestionsField,
				{ key: 'Settings', displayName: 'Settings (JSON)', type: 'json', default: '{}', description: 'Survey settings object' },
				{ key: 'Status', displayName: 'Active', type: 'boolean', default: true, description: 'Whether the survey accepts responses' },
				{ key: 'SurveyName', displayName: 'Survey Name', type: 'string' },
			],
			optionalLabel: 'Update Fields',
		},
	],
};
