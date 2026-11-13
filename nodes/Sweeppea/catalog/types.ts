/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/catalog/types.ts

	(c) Sweeppea, all rights reserved.
*/

/*
 * Catalog Types
 * Every Sweeppea API V3 Endpoint Added After v0.2 Is Described Once As Data.
 * The Node Description (UI) And The Generic Executor Are Both Derived From
 * These Definitions, So The UI And The HTTP Payload Can Never Drift Apart
 */

export type CatalogFieldType =
	| 'binary'
	| 'boolean'
	| 'collection'
	| 'date'
	| 'dateTime'
	| 'group'
	| 'groupOrAll'
	| 'itemList'
	| 'json'
	| 'multiline'
	| 'number'
	| 'options'
	| 'string'
	| 'stringList'
	| 'sweepstake'
	| 'timezone';

export interface CatalogOption {
	name        : string;
	value       : string | number;
	description?: string;
}

export interface CatalogField {

	/* Exact Body Key Expected By The API (Casing Is Inconsistent Across Endpoints) */
	key          : string;
	displayName  : string;
	type         : CatalogFieldType;
	required?    : boolean;
	description? : string;
	default?     : string | number | boolean;
	placeholder? : string;
	options?     : CatalogOption[];
	min?         : number;
	max?         : number;

	/* Children For "collection" (Object) And "itemList" (Array Of Objects) */
	fields?      : CatalogField[];

	/* JSON Fields Only: Merge The Parsed Object Into The Body Root Instead Of Under `key` */
	spread?      : boolean;

	/*
	 * Node-side Setting That Is Never Sent To The API (e.g. The Output Binary Property).
	 * For "binary" Fields The Value Is The Input Binary Property Name; The Executor Sends
	 * Its Base64 Content Under `key` And Fills Filename / MimeType From The File Metadata
	 */
	local?       : boolean;

	/* Rendered By The Hand-written v0.2 Description (Same Parameter Name): Read, But Not Generated Again */
	sharedParameter?: boolean;
}

export interface CatalogPagination {

	/* Body Key For The Page Number (Page | page) */
	pageKey      : string;

	/* Body Key For The Page Size (ItemsPerPage | Limit | limit) */
	sizeKey      : string;

	/* Largest Page Size The Endpoint Accepts */
	maxSize      : number;
}

export interface CatalogOperation {
	value        : string;
	name         : string;
	action       : string;
	description  : string;
	endpoint     : string;
	method?      : 'POST' | 'PUT' | 'DELETE';

	/* Top-level Parameters (Usually The Required Ones) */
	fields?      : CatalogField[];

	/* Optional Parameters, Grouped In One Collection */
	optional?    : CatalogField[];
	optionalLabel?: 'Additional Fields' | 'Filters' | 'Options' | 'Update Fields';

	/* Split The Returned List Into One n8n Item Per Element */
	list?        : boolean;

	/* Key Of The List Inside `Data` (Or The Response Root). Auto-detected When Omitted */
	listKey?     : string | string[];

	/* Page Through The Endpoint (Implies list) */
	pagination?  : CatalogPagination;

	/* At Least One Of These Body Keys Must Be Present */
	requireOneOf?: string[];

	/* Message For HTTP 404, Instead Of The Legacy Sweepstake Message */
	notFound?    : string;

	/* Download `Data.Url` From The Response Into An n8n Binary Property (Files) */
	downloadUrl? : boolean;
}

export interface CatalogResource {
	value        : string;
	name         : string;
	operations   : CatalogOperation[];

	/* Default Operation (Only Used For Resources New In v0.3) */
	defaultOperation: string;

	/*
	 * True When The Resource Already Existed In v0.2 (Participant, Rule,
	 * Sweepstake, Winner). Its Operation Selector Stays Hand-written For
	 * Backwards Compatibility; Only The Fields Of The New Ops Are Generated
	 */
	extendsExisting?: boolean;
}
