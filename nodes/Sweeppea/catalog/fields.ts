/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/catalog/fields.ts

	(c) Sweeppea, all rights reserved.
*/

import { CatalogField } from './types';

/* Sweepstake Picker — Dropdown Loaded From /sweepstakes/fetch */
export function sweepstakeField(
	_key: 'SweepstakesToken' | 'sweepstakesToken',
	_required = true,
): CatalogField {

	return {
		key         : _key,
		displayName : 'Sweepstake',
		type        : 'sweepstake',
		required    : _required,
		description : 'The sweepstake to work with. Choose from the list, or specify a Sweepstakes Token using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	};
}

/* Plain UUID Token Field (Participant, Code, Note, Invoice, ...) */
export function tokenField(
	_key: string,
	_displayName: string,
	_description: string,
	_required = true,
): CatalogField {

	return {
		key         : _key,
		displayName : _displayName,
		type        : 'string',
		required    : _required,
		description : _description,
		placeholder : '83d12d10-7a6d-4f99-a546-5a1c3cc267f9',
	};
}

/* Idempotency Key Shared By Every Endpoint That Sends A Message */
export const idempotencyKeyField: CatalogField = {
	key         : 'IdempotencyKey',
	displayName : 'Idempotency Key',
	type        : 'string',
	description : '8 to 64 characters (letters, digits, - or _). Retrying with the same key never sends twice. Recommended inside loops and retries.',
};

/* Channel Picker For Messaging Endpoints */
export const emailOrSmsOptions = [
	{ name: 'Email', value: 'email' },
	{ name: 'SMS', value: 'sms' },
];

export const emailSmsOrBothOptions = [
	{ name: 'Both', value: 'both', description: 'Send on every channel the participant has a usable address for' },
	{ name: 'Email', value: 'email' },
	{ name: 'SMS', value: 'sms' },
];

/* Pagination Presets */
export const PAGE_ITEMS_PER_PAGE_100 = { pageKey: 'Page', sizeKey: 'ItemsPerPage', maxSize: 100 };
export const PAGE_LIMIT_LOWER_100    = { pageKey: 'page', sizeKey: 'limit', maxSize: 100 };
