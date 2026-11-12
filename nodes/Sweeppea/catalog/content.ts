/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/catalog/content.ts

	(c) Sweeppea, all rights reserved.
*/

import { CatalogResource } from './types';
import { sweepstakeField, tokenField } from './fields';

const fileTokenField = tokenField('FileToken', 'File Token', 'Token of the file in Sweeppea Drive');

/* File — Sweeppea Drive (Uploads Are Sent As Base64 JSON, Max 10 MB) */
export const fileResource: CatalogResource = {
	value            : 'file',
	name             : 'File',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete a file',
			description : 'Permanently delete a file from Sweeppea Drive. Cannot be undone.',
			endpoint    : '/files/delete',
			fields      : [fileTokenField],
			notFound    : 'File not found or access denied.',
		},
		{
			value       : 'download',
			name        : 'Download',
			action      : 'Download a file',
			description : 'Download a Drive file into an n8n binary property (through a short-lived URL)',
			endpoint    : '/files/getFileUrl',
			fields      : [
				fileTokenField,
				{ key: 'binaryPropertyName', displayName: 'Put Output File in Field', type: 'string', required: true, default: 'data', local: true, description: 'Name of the binary property the file is written to' },
			],
			downloadUrl : true,
			notFound    : 'File not found or access denied.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many files',
			description : 'List Drive files, newest first',
			endpoint    : '/files/fetch',
			listKey     : 'Files',
			pagination  : { pageKey: 'Page', sizeKey: 'Limit', maxSize: 200 },
		},
		{
			value       : 'getUrl',
			name        : 'Get URL',
			action      : 'Get a file URL',
			description : 'Get a short-lived presigned URL to preview or download a file',
			endpoint    : '/files/getFileUrl',
			fields      : [fileTokenField],
			optional    : [
				{ key: 'ExpiresIn', displayName: 'Expires In (Seconds)', type: 'number', default: 900, min: 60, max: 3600 },
				{
					key         : 'Mode',
					displayName : 'Mode',
					type        : 'options',
					default     : 'preview',
					options     : [
						{ name: 'Download (Attachment)', value: 'download' },
						{ name: 'Preview (Inline)', value: 'preview' },
					],
				},
			],
			optionalLabel: 'Options',
			notFound    : 'File not found or access denied.',
		},
		{
			value       : 'send',
			name        : 'Send by Email',
			action      : 'Send a file by email',
			description : 'Email a Drive file as an attachment (max 5 MB) with the Sweeppea template',
			endpoint    : '/files/send',
			fields      : [
				fileTokenField,
				{ key: 'RecipientEmail', displayName: 'Recipient Email', type: 'string', required: true, placeholder: 'name@email.com' },
			],
			optional    : [
				{ key: 'EmailMessage', displayName: 'Message', type: 'multiline' },
				{ key: 'EmailSubject', displayName: 'Subject', type: 'string', description: 'Defaults to "File shared from Sweeppea"' },
			],
			notFound    : 'File not found or access denied.',
		},
		{
			value       : 'upload',
			name        : 'Upload',
			action      : 'Upload a file',
			description : 'Upload a file from an n8n binary property (max 10 MB; PDF, Office, TXT, CSV and images)',
			endpoint    : '/files/upload',
			fields      : [
				{ key: 'FileData', displayName: 'Input Binary Field', type: 'binary', required: true, default: 'data', description: 'Name of the input binary property that holds the file' },
			],
			optional    : [
				{ key: 'Filename', displayName: 'File Name', type: 'string', description: 'Defaults to the name of the binary file. Must be unique in the Drive.' },
				{ key: 'MimeType', displayName: 'MIME Type', type: 'string', description: 'Defaults to the MIME type of the binary file' },
				{ key: 'Private', displayName: 'Private', type: 'boolean', default: true, description: 'Whether the file is private' },
			],
			optionalLabel: 'Options',
		},
	],
};

/* Entry Page — Settings Of A Sweepstake's Public Entry Page (Max 5 Fields Per Update) */
export const entryPageResource: CatalogResource = {
	value            : 'entryPage',
	name             : 'Entry Page',
	defaultOperation : 'getSettings',
	operations       : [
		{
			value       : 'getFields',
			name        : 'Get Form Fields',
			action      : 'Get entry page form fields',
			description : 'The form fields of the entry page (exact names to use when adding participants)',
			endpoint    : '/entrypage/fields',
			fields      : [sweepstakeField('SweepstakesToken')],
		},
		{
			value       : 'getSettings',
			name        : 'Get Settings',
			action      : 'Get entry page settings',
			description : 'Every setting of the entry page: texts, opt-ins, age gate, AMOE, widgets, branding',
			endpoint    : '/entrypage/settings',
			fields      : [sweepstakeField('SweepstakesToken')],
			notFound    : 'Entry page not found.',
		},
		{
			value       : 'update',
			name        : 'Update Settings',
			action      : 'Update entry page settings',
			description : 'Change 1 to 5 entry page settings per call (partial update)',
			endpoint    : '/entrypage/update',
			fields      : [sweepstakeField('SweepstakesToken')],
			optional    : [
				{ key: 'ActivateAgeGateSwitch', displayName: 'Age Gate', type: 'boolean', default: true, description: 'Whether the age gate is shown' },
				{
					key         : 'AgeGateMinAge',
					displayName : 'Age Gate Minimum Age',
					type        : 'options',
					default     : 2,
					options     : [
						{ name: '13+', value: 1 },
						{ name: '18+', value: 2 },
						{ name: '21+ (Required for Alcohol)', value: 3 },
					],
				},
				{ key: 'ActivateAmoeSwitch', displayName: 'AMOE Page', type: 'boolean', default: true, description: 'Whether the free alternative method of entry page is active' },
				{ key: 'ActivateWinnersSwitch', displayName: 'Winners Page', type: 'boolean', default: true, description: 'Whether the public winners page is active' },
				{ key: 'AmoeEntries', displayName: 'AMOE Entries', type: 'number', default: 1, min: 0, description: 'Entries awarded per AMOE request' },
				{ key: 'BonusEntriesSwitch', displayName: 'Bonus Entries', type: 'boolean', default: true, description: 'Whether bonus entries are enabled' },
				{ key: 'BonusEntriesValue', displayName: 'Bonus Entries Value', type: 'number', default: 1, min: 0 },
				{ key: 'ConfirmationPageDescription', displayName: 'Confirmation Page Description', type: 'multiline' },
				{ key: 'ConfirmationPageHeadline', displayName: 'Confirmation Page Headline', type: 'string' },
				{ key: 'EmailOptInSwitch', displayName: 'Email Opt-in', type: 'boolean', default: true, description: 'Whether the email opt-in checkbox is shown' },
				{ key: 'EnableNumberOfParticipants', displayName: 'Show Number of Participants', type: 'boolean', default: true, description: 'Whether to show the number of participants' },
				{ key: 'EnableSweepstakesCountdown', displayName: 'Show Countdown', type: 'boolean', default: true, description: 'Whether to show the countdown' },
				{ key: 'EntryPageAbbreviatedRules', displayName: 'Abbreviated Rules', type: 'multiline' },
				{ key: 'EntryPageButtonColor', displayName: 'Button Color', type: 'string', placeholder: '#7bd63a' },
				{ key: 'EntryPageDescription', displayName: 'Description', type: 'multiline' },
				{ key: 'EntryPageHeadline', displayName: 'Headline', type: 'string' },
				{ key: 'ExternalConfirmationPageURI', displayName: 'External Confirmation Page URL', type: 'string' },
				{ key: 'OtherSettings', displayName: 'Other Settings (JSON)', type: 'json', spread: true, default: '{}', description: 'Any other whitelisted setting as a flat object, e.g. {"EnableShareWidget": true}. See the Entry Page Update page of the Sweeppea API docs for the full list.' },
				{ key: 'SelectedOfficialRules', displayName: 'Official Rules Token', type: 'string', description: 'Token of the rules document linked to the page' },
				{ key: 'TermsConditionsSwitch', displayName: 'Terms Checkbox', type: 'boolean', default: true, description: 'Whether the terms and conditions checkbox is shown' },
			],
			optionalLabel: 'Update Fields',
			notFound    : 'Entry page not found.',
		},
	],
};

/* Participant — Operations Added On Top Of The v0.2 Ones */
export const participantExtension: CatalogResource = {
	value            : 'participant',
	name             : 'Participant',
	defaultOperation : 'create',
	extendsExisting  : true,
	operations       : [
		{
			value       : 'updateBonusEntries',
			name        : 'Update Bonus Entries',
			action      : 'Update bonus entries of a participant',
			description : 'Set (overwrite, not add) the bonus entries of a participant',
			endpoint    : '/participants/updateBonusEntries',
			fields      : [
				{ ...sweepstakeField('SweepstakesToken'), sharedParameter: true },
				tokenField('ParticipantToken', 'Participant Token', 'Token of the participant'),
				{ key: 'BonusEntries', displayName: 'Bonus Entries', type: 'number', required: true, default: 0, min: 0, max: 1000000, description: 'New total of bonus entries (replaces the current value)' },
			],
			notFound    : 'Participant not found in this sweepstake.',
		},
	],
};
