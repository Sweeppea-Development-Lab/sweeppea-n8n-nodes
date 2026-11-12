/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/catalog/workspace.ts

	(c) Sweeppea, all rights reserved.
*/

import { CatalogField, CatalogResource } from './types';
import { sweepstakeField, tokenField } from './fields';

/* Billing — Transactions, Consumptions, Data Transfer And Wallet */
export const billingResource: CatalogResource = {
	value            : 'billing',
	name             : 'Billing',
	defaultOperation : 'getTransactions',
	operations       : [
		{
			value       : 'getConsumptions',
			name        : 'Get Consumptions',
			action      : 'Get consumptions',
			description : 'Monthly and yearly consumption totals',
			endpoint    : '/billing/consumptions',
		},
		{
			value       : 'getDataTransfer',
			name        : 'Get Data Transfer',
			action      : 'Get data transfer logs',
			description : 'Data transfer billing logs of a sweepstake',
			endpoint    : '/billing/datatransfer',
			listKey     : 'DataTransfer',
			fields      : [sweepstakeField('SweepstakesToken')],
			list        : true,
		},
		{
			value       : 'getTransactions',
			name        : 'Get Transactions',
			action      : 'Get billing transactions',
			description : 'Every billing transaction of the account',
			endpoint    : '/billing/fetchtransactions',
			listKey     : 'Transactions',
			list        : true,
		},
		{
			value       : 'getWalletTransactions',
			name        : 'Get Wallet Transactions',
			action      : 'Get wallet transactions',
			description : 'Every wallet credit and debit of the account',
			endpoint    : '/wallet/fetchtransactions',
			listKey     : 'Transactions',
			list        : true,
		},
	],
};

const eventTokenField = tokenField('EventToken', 'Event Token', 'Token of the calendar event');

/* Calendar Fields Shared By Create And Update */
const calendarOptional: CatalogField[] = [
	{ key: 'Completed', displayName: 'Completed', type: 'boolean', default: false, description: 'Whether the event is completed' },
	{ key: 'EventAllDay', displayName: 'All Day', type: 'boolean', default: false, description: 'Whether the event lasts all day' },
	{ key: 'EventColor', displayName: 'Color', type: 'string', default: '#6CD9FF', description: 'Hex color of the event' },
	{ key: 'EventDescription', displayName: 'Description', type: 'multiline' },
	{ key: 'EventEndTime', displayName: 'End Time', type: 'string', placeholder: '23:59', description: 'HH:mm, 24-hour clock' },
	{ key: 'EventLocation', displayName: 'Location', type: 'string' },
	{ key: 'EventStartTime', displayName: 'Start Time', type: 'string', placeholder: '09:00', description: 'HH:mm, 24-hour clock' },
	{ key: 'EventURL', displayName: 'URL', type: 'string' },
	{ key: 'PrivateEvent', displayName: 'Private', type: 'boolean', default: false, description: 'Whether the event is private' },
	{ key: 'SMSNotification', displayName: 'SMS Notification', type: 'boolean', default: false, description: 'Whether to send an SMS reminder' },
];

/* Calendar Event — The Sweeppea Calendar */
export const calendarResource: CatalogResource = {
	value            : 'calendarEvent',
	name             : 'Calendar Event',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'create',
			name        : 'Create',
			action      : 'Create a calendar event',
			description : 'Create a calendar event (not in the past)',
			endpoint    : '/calendar/create',
			fields      : [
				{ key: 'EventTitle', displayName: 'Title', type: 'string', required: true },
				{ key: 'EventStartDate', displayName: 'Start', type: 'dateTime', required: true, description: 'Must be in the future' },
				{ key: 'EventEndDate', displayName: 'End', type: 'dateTime', required: true, description: 'Must be in the future' },
			],
			optional    : [
				...calendarOptional,
				{ key: 'SweepstakesToken', displayName: 'Sweepstakes Token', type: 'string', description: 'Link the event to a sweepstake' },
			],
		},
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete a calendar event',
			description : 'Permanently delete a calendar event',
			endpoint    : '/calendar/delete',
			method      : 'DELETE',
			fields      : [eventTokenField],
			notFound    : 'Calendar event not found.',
		},
		{
			value       : 'get',
			name        : 'Get',
			action      : 'Get a calendar event',
			description : 'Retrieve one calendar event',
			endpoint    : '/calendar/single',
			fields      : [eventTokenField],
			notFound    : 'Calendar event not found.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many calendar events',
			description : 'Every calendar event of the account',
			endpoint    : '/calendar/fetch',
			listKey     : 'Events',
			list        : true,
		},
		{
			value       : 'update',
			name        : 'Update',
			action      : 'Update a calendar event',
			description : 'Change an existing calendar event',
			endpoint    : '/calendar/update',
			method      : 'PUT',
			fields      : [eventTokenField],
			optional    : [
				...calendarOptional,
				{ key: 'EventEndDate', displayName: 'End', type: 'dateTime' },
				{ key: 'EventStartDate', displayName: 'Start', type: 'dateTime' },
				{ key: 'EventTitle', displayName: 'Title', type: 'string' },
			],
			optionalLabel: 'Update Fields',
			notFound    : 'Calendar event not found.',
		},
	],
};

const billToFields: CatalogField[] = [
	{ key: 'Name', displayName: 'Name', type: 'string', description: 'Required. Max 100 characters.' },
	{ key: 'Email', displayName: 'Email', type: 'string', placeholder: 'name@email.com', description: 'Required. Max 100 characters.' },
	{ key: 'Address', displayName: 'Address', type: 'string' },
	{ key: 'City', displayName: 'City', type: 'string' },
	{ key: 'Company', displayName: 'Company', type: 'string' },
	{ key: 'Country', displayName: 'Country', type: 'string' },
	{ key: 'Phone', displayName: 'Phone', type: 'string' },
	{ key: 'State', displayName: 'State', type: 'string' },
	{ key: 'TaxId', displayName: 'Tax ID', type: 'string' },
	{ key: 'ZipCode', displayName: 'Zip Code', type: 'string' },
];

const invoiceItemFields: CatalogField[] = [
	{ key: 'Description', displayName: 'Description', type: 'string', description: 'Max 300 characters' },
	{ key: 'Quantity', displayName: 'Quantity', type: 'number', default: 1, min: 0, max: 100 },
	{ key: 'Rate', displayName: 'Rate', type: 'number', default: 0, min: 0, max: 1000000, description: 'Unit price. Amount is always computed server-side as Quantity × Rate.' },
];

const invoiceOptional: CatalogField[] = [
	{ key: 'DiscountAmount', displayName: 'Discount Amount', type: 'number', default: 0, min: 0 },
	{ key: 'DueDate', displayName: 'Due Date', type: 'date' },
	{ key: 'IssueDate', displayName: 'Issue Date', type: 'date' },
	{ key: 'NotesToRecipient', displayName: 'Notes to Recipient', type: 'multiline' },
	{ key: 'PaymentInstructions', displayName: 'Payment Instructions', type: 'multiline' },
	{
		key         : 'PaymentMethod',
		displayName : 'Payment Method',
		type        : 'options',
		default     : 'card',
		options     : [
			{ name: 'Bank Transfer', value: 'transfer' },
			{ name: 'Card', value: 'card' },
			{ name: 'Check', value: 'check' },
		],
	},
	{ key: 'TaxEnabled', displayName: 'Tax Enabled', type: 'boolean', default: false, description: 'Whether to apply tax' },
	{ key: 'TaxLabel', displayName: 'Tax Label', type: 'string', default: 'Tax' },
	{ key: 'TaxRate', displayName: 'Tax Rate (%)', type: 'number', default: 0, min: 0, max: 100 },
	{ key: 'Terms', displayName: 'Terms', type: 'multiline' },
	{ key: 'Title', displayName: 'Title', type: 'string' },
];

const invoiceTokenField = tokenField('InvoiceToken', 'Invoice Token', 'Token of the invoice');

/* Invoice — Invoices Sent To Clients (Never Emailed By The API) */
export const invoiceResource: CatalogResource = {
	value            : 'invoice',
	name             : 'Invoice',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'create',
			name        : 'Create',
			action      : 'Create an invoice',
			description : 'Create an invoice from a recipient and line items. Totals are computed server-side; the recipient is never emailed.',
			endpoint    : '/invoices/create',
			fields      : [
				{ key: 'BillTo', displayName: 'Bill To', type: 'collection', required: true, fields: billToFields, description: 'Recipient. Name and Email are required.' },
				{ key: 'Items', displayName: 'Line Items', type: 'itemList', required: true, fields: invoiceItemFields },
			],
			optional    : [
				...invoiceOptional,
				{
					key         : 'Status',
					displayName : 'Status',
					type        : 'options',
					default     : 'draft',
					options     : [
						{ name: 'Draft', value: 'draft' },
						{ name: 'Pending (Published)', value: 'pending' },
					],
				},
			],
		},
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete an invoice',
			description : 'Permanently delete an invoice and its event trail. Cannot be undone.',
			endpoint    : '/invoices/delete',
			fields      : [invoiceTokenField],
			notFound    : 'Invoice not found.',
		},
		{
			value       : 'get',
			name        : 'Get',
			action      : 'Get an invoice',
			description : 'One invoice in full: items, totals, payment link, QR code, views and timeline',
			endpoint    : '/invoices/single',
			fields      : [invoiceTokenField],
			optional    : [
				{ key: 'IncludeEvents', displayName: 'Include Events', type: 'boolean', default: true, description: 'Whether to include the event timeline' },
				{ key: 'IncludeQrCode', displayName: 'Include QR Code', type: 'boolean', default: true, description: 'Whether to include the payment QR code' },
			],
			optionalLabel: 'Options',
			notFound    : 'Invoice not found.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many invoices',
			description : 'List invoices with pending, paid and overdue totals',
			endpoint    : '/invoices/fetch',
			listKey     : 'Invoices',
			optional    : [
				{ key: 'FromDate', displayName: 'From Date', type: 'date' },
				{
					key         : 'Status',
					displayName : 'Status',
					type        : 'options',
					default     : 'pending',
					options     : [
						{ name: 'Cancelled', value: 'cancelled' },
						{ name: 'Draft', value: 'draft' },
						{ name: 'Paid', value: 'paid' },
						{ name: 'Pending', value: 'pending' },
					],
				},
				{ key: 'ToDate', displayName: 'To Date', type: 'date' },
			],
			optionalLabel: 'Filters',
			pagination  : { pageKey: 'Page', sizeKey: 'Limit', maxSize: 200 },
		},
		{
			value       : 'update',
			name        : 'Update',
			action      : 'Update an invoice',
			description : 'Edit a draft or pending invoice, publish it (Status Pending) or cancel it',
			endpoint    : '/invoices/update',
			fields      : [invoiceTokenField],
			optional    : [
				{ key: 'BillTo', displayName: 'Bill To', type: 'collection', fields: billToFields },
				{ key: 'Items', displayName: 'Line Items', type: 'itemList', fields: invoiceItemFields, description: 'Replaces every line item' },
				...invoiceOptional,
				{
					key         : 'Status',
					displayName : 'Status',
					type        : 'options',
					default     : 'pending',
					options     : [
						{ name: 'Cancelled', value: 'cancelled' },
						{ name: 'Pending (Publish)', value: 'pending' },
					],
				},
			],
			optionalLabel: 'Update Fields',
			notFound    : 'Invoice not found.',
		},
	],
};

const noteTokenField = tokenField('NoteToken', 'Note Token', 'Token of the note');

/* Note — Encrypted Personal Notes */
export const noteResource: CatalogResource = {
	value            : 'note',
	name             : 'Note',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'create',
			name        : 'Create',
			action      : 'Create a note',
			description : 'Create an encrypted note (titles are unique per user)',
			endpoint    : '/notes/create',
			fields      : [
				{ key: 'Title', displayName: 'Title', type: 'string', required: true, description: 'Unique title, max 100 characters' },
				{ key: 'Note', displayName: 'Content', type: 'multiline', required: true, description: 'Max 100,000 characters, stored encrypted' },
			],
			optional    : [{ key: 'Pinned', displayName: 'Pinned', type: 'boolean', default: false, description: 'Whether to pin the note' }],
		},
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete a note',
			description : 'Permanently delete a note',
			endpoint    : '/notes/delete',
			fields      : [noteTokenField],
			notFound    : 'Note not found.',
		},
		{
			value       : 'get',
			name        : 'Get',
			action      : 'Get a note',
			description : 'Retrieve one note with its decrypted content',
			endpoint    : '/notes/single',
			fields      : [noteTokenField],
			notFound    : 'Note not found.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many notes',
			description : 'Every note of the authenticated user',
			endpoint    : '/notes/fetch',
			listKey     : 'Notes',
			list        : true,
		},
		{
			value       : 'update',
			name        : 'Update',
			action      : 'Update a note',
			description : 'Change the title, content or pinned state of a note',
			endpoint    : '/notes/update',
			fields      : [noteTokenField],
			optional    : [
				{ key: 'Note', displayName: 'Content', type: 'multiline' },
				{ key: 'Pinned', displayName: 'Pinned', type: 'boolean', default: false, description: 'Whether the note is pinned' },
				{ key: 'Title', displayName: 'Title', type: 'string' },
			],
			optionalLabel: 'Update Fields',
			notFound    : 'Note not found.',
		},
	],
};

const priorityOptions = [
	{ name: 'High', value: 3 },
	{ name: 'Low', value: 1 },
	{ name: 'Medium', value: 2 },
];

const platformOptions = [
	'api', 'aws', 'blog', 'enewsletter', 'general', 'instakes', 'mcp-server', 'n8n', 'other', 'overture',
	'papyrus', 'renaissance', 'shopify', 'socialmedia', 'sonata', 'soprano', 'sweeppea-cli', 'symphony', 'website', 'winners',
].map(_platform => ({ name: _platform, value: _platform }));

const caseNumberField = (_key: 'CaseId' | 'caseNumber'): CatalogField => ({
	key         : _key,
	displayName : 'Case Number',
	type        : 'string',
	required    : true,
	placeholder : '1234567',
	description : 'The 7-digit case number of the ticket',
});

/* Support Ticket — Tickets To The Sweeppea Team */
export const ticketResource: CatalogResource = {
	value            : 'ticket',
	name             : 'Support Ticket',
	defaultOperation : 'getManyOpen',
	operations       : [
		{
			value       : 'create',
			name        : 'Create',
			action      : 'Create a support ticket',
			description : 'Open a support ticket with the Sweeppea team',
			endpoint    : '/tickets/create',
			fields      : [
				{ key: 'Title', displayName: 'Title', type: 'string', required: true },
				{ key: 'Description', displayName: 'Description', type: 'multiline', required: true },
				{ key: 'Priority', displayName: 'Priority', type: 'options', required: true, default: 2, options: priorityOptions },
			],
			optional    : [
				{ key: 'AssignTo', displayName: 'Assign To', type: 'string', description: 'Admin to assign the ticket to' },
				{ key: 'Platform', displayName: 'Platform', type: 'options', default: 'general', options: platformOptions, description: 'Product the ticket is about' },
			],
		},
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete a support ticket',
			description : 'Permanently delete a support ticket',
			endpoint    : '/tickets/delete',
			fields      : [caseNumberField('CaseId')],
			notFound    : 'Ticket not found.',
		},
		{
			value       : 'get',
			name        : 'Get',
			action      : 'Get a support ticket',
			description : 'One ticket with its notes and history',
			endpoint    : '/tickets/fetchSingleTicket',
			fields      : [caseNumberField('caseNumber')],
			notFound    : 'Ticket not found.',
		},
		{
			value       : 'getManyClosed',
			name        : 'Get Many Closed',
			action      : 'Get closed support tickets',
			description : 'List closed or resolved tickets',
			endpoint    : '/tickets/fetchClosedTickets',
			listKey     : 'Tickets',
			optional    : [
				{ key: 'page', displayName: 'Page', type: 'number', default: 1, min: 1 },
				{ key: 'platform', displayName: 'Platform', type: 'options', default: 'general', options: platformOptions },
				{ key: 'priority', displayName: 'Priority', type: 'options', default: 2, options: priorityOptions },
				{ key: 'search', displayName: 'Search', type: 'string' },
			],
			optionalLabel: 'Filters',
			list        : true,
		},
		{
			value       : 'getManyOpen',
			name        : 'Get Many Open',
			action      : 'Get open support tickets',
			description : 'List open tickets',
			endpoint    : '/tickets/fetchOpenTickets',
			listKey     : 'Tickets',
			optional    : [
				{ key: 'page', displayName: 'Page', type: 'number', default: 1, min: 1 },
				{ key: 'platform', displayName: 'Platform', type: 'options', default: 'general', options: platformOptions },
				{ key: 'priority', displayName: 'Priority', type: 'options', default: 2, options: priorityOptions },
				{ key: 'search', displayName: 'Search', type: 'string' },
			],
			optionalLabel: 'Filters',
			list        : true,
		},
		{
			value       : 'resolve',
			name        : 'Resolve',
			action      : 'Resolve a support ticket',
			description : 'Mark a ticket as resolved',
			endpoint    : '/tickets/resolve',
			fields      : [caseNumberField('CaseId')],
			notFound    : 'Ticket not found.',
		},
		{
			value       : 'update',
			name        : 'Update',
			action      : 'Update a support ticket',
			description : 'Change the title or description of a ticket',
			endpoint    : '/tickets/update',
			fields      : [caseNumberField('CaseId')],
			optional    : [
				{ key: 'Description', displayName: 'Description', type: 'multiline' },
				{ key: 'Title', displayName: 'Title', type: 'string' },
			],
			optionalLabel: 'Update Fields',
			notFound    : 'Ticket not found.',
		},
	],
};

/* To-Do — Task List Of The Account */
export const todoResource: CatalogResource = {
	value            : 'todo',
	name             : 'To-Do',
	defaultOperation : 'getMany',
	operations       : [
		{
			value       : 'create',
			name        : 'Create',
			action      : 'Create a to-do',
			description : 'Add a task to the to-do list',
			endpoint    : '/tickets/createTodo',
			fields      : [
				{ key: 'Title', displayName: 'Title', type: 'string', required: true, description: 'Max 200 characters' },
				{ key: 'Priority', displayName: 'Priority', type: 'options', required: true, default: 2, options: priorityOptions },
			],
			optional    : [
				{ key: 'Deadline', displayName: 'Deadline', type: 'date' },
				{ key: 'Description', displayName: 'Description', type: 'multiline', description: 'Allowed HTML: b, strong, i, hr, br' },
				{ key: 'Pin', displayName: 'Pin', type: 'boolean', default: false, description: 'Whether to pin the task to the top' },
				{ key: 'ResourceAffected', displayName: 'Resource Affected', type: 'string', default: 'general', description: 'E.g. general, api, aws' },
			],
		},
		{
			value       : 'delete',
			name        : 'Delete',
			action      : 'Delete a to-do',
			description : 'Permanently delete a task (admin API keys only)',
			endpoint    : '/tickets/deleteTodo',
			fields      : [tokenField('TodoToken', 'To-Do Token', 'Token of the task')],
			notFound    : 'To-do not found.',
		},
		{
			value       : 'getMany',
			name        : 'Get Many',
			action      : 'Get many to-dos',
			description : 'List tasks with optional filters',
			endpoint    : '/tickets/fetchTodos',
			listKey     : 'Todos',
			optional    : [
				{ key: 'dateFrom', displayName: 'From Date', type: 'date' },
				{ key: 'dateTo', displayName: 'To Date', type: 'date' },
				{ key: 'page', displayName: 'Page', type: 'number', default: 1, min: 1 },
				{ key: 'pinned', displayName: 'Pinned Only', type: 'boolean', default: false, description: 'Whether to list only pinned tasks' },
				{ key: 'priority', displayName: 'Priority', type: 'options', default: 2, options: priorityOptions },
				{ key: 'search', displayName: 'Search', type: 'string' },
				{
					key         : 'status',
					displayName : 'Status',
					type        : 'options',
					default     : 'pending',
					options     : [
						{ name: 'Completed', value: 'completed' },
						{ name: 'Pending', value: 'pending' },
					],
				},
			],
			optionalLabel: 'Filters',
			list        : true,
		},
		{
			value       : 'update',
			name        : 'Update',
			action      : 'Update a to-do',
			description : 'Change a task, mark it completed or set its progress (admin API keys only)',
			endpoint    : '/tickets/updateTodo',
			fields      : [tokenField('TodoToken', 'To-Do Token', 'Token of the task')],
			optional    : [
				{ key: 'Completion', displayName: 'Completion (%)', type: 'number', default: 0, min: 0, max: 100 },
				{ key: 'Deadline', displayName: 'Deadline', type: 'date' },
				{ key: 'Description', displayName: 'Description', type: 'multiline' },
				{ key: 'Pin', displayName: 'Pin', type: 'boolean', default: false, description: 'Whether the task is pinned' },
				{ key: 'Priority', displayName: 'Priority', type: 'options', default: 2, options: priorityOptions },
				{ key: 'ResourceAffected', displayName: 'Resource Affected', type: 'string' },
				{ key: 'Status', displayName: 'Completed', type: 'boolean', default: false, description: 'Whether the task is completed' },
				{ key: 'Title', displayName: 'Title', type: 'string' },
			],
			optionalLabel: 'Update Fields',
			notFound    : 'To-do not found.',
		},
	],
};
