/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/operations/catalog.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

import { sweeppeaApiRequest } from '../GenericFunctions';
import { CatalogField, CatalogOperation } from '../catalog';

import {
	CATALOG_OPTIONS_PARAMETER,
	catalogParameterName,
} from '../descriptions/CatalogDescription';

/* Safety Net So A Misbehaving Endpoint Can Never Loop Forever */
const MAX_PAGES = 1000;

/* Accepts "2026-12-31", "2026-12-31T00:00:00" Or A Luxon-like Object; Returns YYYY-MM-DD */
function toApiDate(_value: unknown): string {

	const text = String(_value).trim();

	return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : text;
}

/* Accepts An Array Or A Comma / New-line Separated String */
function toStringList(_value: unknown): string[] {

	if (Array.isArray(_value)) {

		return _value.map(_v => String(_v).trim()).filter(_v => _v !== '');
	}

	return String(_value ?? '')
		.split(/[\n,]/)
		.map(_v => _v.trim())
		.filter(_v => _v !== '');
}

/* Removes Empty Strings / Nulls So Optional Sub-fields Are Not Sent Blank */
function compact(_object: IDataObject): IDataObject {

	const result: IDataObject = {};

	for (const [key, value] of Object.entries(_object)) {

		if (value === '' || value === null || value === undefined) {

			continue;
		}

		result[key] = value;
	}

	return result;
}

function isEmpty(_value: unknown): boolean {

	return _value === undefined || _value === null || _value === '' || (Array.isArray(_value) && _value.length === 0);
}

/* Converts One Parameter Value To Its API Shape And Writes It Into The Body */
function writeField(
	this: IExecuteFunctions,
	_body: IDataObject,
	_field: CatalogField,
	_raw: unknown,
	_itemIndex: number,
): void {

	let value: unknown = _raw;

	switch (_field.type) {

		case 'number':
			value = isEmpty(_raw) ? undefined : Number(_raw);
			break;

		case 'timezone':
			value = isEmpty(_raw) ? undefined : (Number.isFinite(Number(_raw)) ? Number(_raw) : _raw);
			break;

		case 'boolean':
			value = Boolean(_raw);
			break;

		case 'date':
			value = isEmpty(_raw) ? undefined : toApiDate(_raw);
			break;

		case 'dateTime':
			value = isEmpty(_raw) ? undefined : String(_raw);
			break;

		case 'stringList':
			value = toStringList(_raw);
			break;

		case 'json': {

			let parsed: unknown = _raw;

			if (typeof _raw === 'string') {

				const text = _raw.trim();

				if (text === '') {

					parsed = undefined;

				} else {

					try {

						parsed = JSON.parse(text);

					} catch {

						throw new NodeOperationError(
							this.getNode(),
							`"${_field.displayName}" must be valid JSON`,
							{ itemIndex: _itemIndex },
						);
					}
				}
			}

			if (_field.spread) {

				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {

					Object.assign(_body, parsed as IDataObject);

					return;
				}

				throw new NodeOperationError(
					this.getNode(),
					`"${_field.displayName}" must be a JSON object`,
					{ itemIndex: _itemIndex },
				);
			}

			value = parsed;
			break;
		}

		case 'collection':
			value = compact((_raw ?? {}) as IDataObject);
			value = Object.keys(value as IDataObject).length > 0 ? value : undefined;
			break;

		case 'itemList':
			value = Array.isArray(_raw)
				? _raw
				: (((_raw ?? {}) as IDataObject).item as IDataObject[] | undefined ?? []).map(compact);
			break;

		default:
			value = isEmpty(_raw) ? undefined : _raw;
			break;
	}

	if (isEmpty(value)) {

		if (_field.required) {

			throw new NodeOperationError(
				this.getNode(),
				`"${_field.displayName}" is required`,
				{ itemIndex: _itemIndex },
			);
		}

		return;
	}

	_body[_field.key] = value as IDataObject[keyof IDataObject];
}

/*
 * Finds The List Inside A Sweeppea Response. The API Is Not Uniform:
 * `Data` Can Be The Array Itself, Or An Object Holding It (Codes, Invoices,
 * Campaigns...), And Some Legacy Endpoints Put It At The Response Root
 */
export function extractList(_response: IDataObject, _listKey?: string | string[]): IDataObject[] | undefined {

	const data = _response.Data;

	if (Array.isArray(data)) {

		return data as IDataObject[];
	}

	const containers: IDataObject[] = [];

	if (data && typeof data === 'object') {

		containers.push(data as IDataObject);
	}

	containers.push(_response);

	/* Explicit Keys (From The API Docs): Arrays Are Concatenated, Single Objects Become One Row */
	if (_listKey) {

		const listKeys = Array.isArray(_listKey) ? _listKey : [_listKey];

		for (const container of containers) {

			if (!listKeys.some(_key => container[_key] !== undefined)) {

				continue;
			}

			const rows: IDataObject[] = [];

			for (const key of listKeys) {

				const value = container[key];

				if (Array.isArray(value)) {

					rows.push(...(value as IDataObject[]));

				} else if (value && typeof value === 'object') {

					rows.push(value as IDataObject);
				}
			}

			return rows;
		}
	}

	/* Longest Array Of Objects Wins (Skips Arrays Of Scalars Like Channels) */
	let best: IDataObject[] | undefined;

	for (const container of containers) {

		for (const [key, value] of Object.entries(container)) {

			if (key === 'Data' || !Array.isArray(value)) {

				continue;
			}

			const isObjectList = value.length === 0 || (typeof value[0] === 'object' && value[0] !== null);

			if (isObjectList && (!best || value.length > best.length)) {

				best = value as IDataObject[];
			}
		}

		if (best) {

			return best;
		}
	}

	return undefined;
}

/* Reads "TotalPages" Wherever The Endpoint Put It */
function extractTotalPages(_response: IDataObject): number | undefined {

	const data       = (_response.Data ?? {}) as IDataObject;
	const pagination = (data.Pagination ?? _response.Pagination ?? {}) as IDataObject;
	const raw        = data.TotalPages ?? pagination.TotalPages ?? _response.TotalPages;
	const parsed     = Number(raw);

	return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function toItems(_rows: IDataObject[], _itemIndex: number): INodeExecutionData[] {

	return _rows.map(_row => ({
		json       : _row,
		pairedItem : { item: _itemIndex },
	}));
}

/*
 * Generic Executor For Every Catalog Operation
 * Builds The Body From The Catalog Definition, Calls The Endpoint, And
 * Shapes The Output (Raw Envelope, Split List, Or Paginated List)
 */
export async function executeCatalogOperation(
	this: IExecuteFunctions,
	_operation: CatalogOperation,
	i: number,
): Promise<INodeExecutionData[]> {

	const body: IDataObject = {};
	const local: IDataObject = {};

	for (const field of _operation.fields ?? []) {

		const raw = this.getNodeParameter(catalogParameterName(field.key), i, undefined);

		/* Node-side Settings And Binary Inputs Are Resolved Below, Not Sent As-is */
		if (field.local || field.type === 'binary') {

			local[field.key] = raw;

			continue;
		}

		writeField.call(this, body, field, raw, i);
	}

	if (_operation.optional?.length) {

		const options = this.getNodeParameter(CATALOG_OPTIONS_PARAMETER, i, {}) as IDataObject;

		for (const field of _operation.optional) {

			if (options[field.key] === undefined) {

				continue;
			}

			/* In "Update Fields", A Text Field Added But Left Empty Clears The Value (Sent As null) */
			const clearable = _operation.optionalLabel === 'Update Fields' && ['string', 'multiline', 'date', 'dateTime'].includes(field.type);

			if (clearable && options[field.key] === '') {

				body[field.key] = null;

				continue;
			}

			writeField.call(this, body, field, options[field.key], i);
		}
	}

	/* Binary Input → Base64 Body Field, With File Name / MIME Type Defaults From The File */
	for (const field of (_operation.fields ?? []).filter(_f => _f.type === 'binary')) {

		const propertyName = String(local[field.key] || 'data');
		const binary       = this.helpers.assertBinaryData(i, propertyName);
		const buffer       = await this.helpers.getBinaryDataBuffer(i, propertyName);

		body[field.key] = buffer.toString('base64');

		if (isEmpty(body.Filename) && binary.fileName) {

			body.Filename = binary.fileName;
		}

		if (isEmpty(body.MimeType) && binary.mimeType) {

			body.MimeType = binary.mimeType;
		}
	}

	if (_operation.requireOneOf && !_operation.requireOneOf.some(_key => !isEmpty(body[_key]))) {

		throw new NodeOperationError(
			this.getNode(),
			`Provide at least one of: ${_operation.requireOneOf.join(', ')}`,
			{ itemIndex: i },
		);
	}

	const method = _operation.method ?? 'POST';

	/* Paginated List */
	if (_operation.pagination) {

		const { pageKey, sizeKey, maxSize } = _operation.pagination;

		const returnAll = this.getNodeParameter('returnAll', i, false) as boolean;
		const limit     = returnAll ? Number.POSITIVE_INFINITY : (this.getNodeParameter('limit', i, 50) as number);
		const pageSize  = Math.min(maxSize, returnAll ? maxSize : limit);
		const results   : IDataObject[] = [];

		for (let page = 1; page <= MAX_PAGES; page++) {

			const response = await sweeppeaApiRequest.call(
				this,
				method,
				_operation.endpoint,
				{ ...body, [pageKey]: page, [sizeKey]: pageSize },
			);

			const rows = extractList(response, _operation.listKey) ?? [];

			results.push(...rows);

			if (results.length >= limit) {

				results.length = limit;

				break;
			}

			const totalPages = extractTotalPages(response);

			if ((totalPages !== undefined && page >= totalPages) || rows.length < pageSize) {

				break;
			}
		}

		return toItems(results, i);
	}

	const response = await sweeppeaApiRequest.call(this, method, _operation.endpoint, body);

	/* File Download: Fetch The Presigned URL Into An n8n Binary Property */
	if (_operation.downloadUrl) {

		const data = (response.Data ?? {}) as IDataObject;

		if (!data.Url) {

			throw new NodeOperationError(this.getNode(), 'Sweeppea did not return a download URL for this file', { itemIndex: i });
		}

		const content = await this.helpers.httpRequest({
			method   : 'GET',
			url      : data.Url as string,
			encoding : 'arraybuffer',
			json     : false,
		}) as ArrayBuffer;

		const property = String(local.binaryPropertyName || 'data');
		const binary   = await this.helpers.prepareBinaryData(
			Buffer.from(content),
			(data.Filename as string) || undefined,
			(data.MimeType as string) || undefined,
		);

		return [{
			json       : data,
			binary     : { [property]: binary },
			pairedItem : { item: i },
		}];
	}

	/* Deletes Follow The n8n Convention Of Returning { deleted: true } (Plus The API Envelope) */
	if (_operation.value === 'delete' && response.Response !== false) {

		return [{
			json       : { deleted: true, ...response },
			pairedItem : { item: i },
		}];
	}

	/* Single-call List */
	if (_operation.list) {

		const rows = extractList(response, _operation.listKey);

		if (rows) {

			return toItems(rows, i);
		}
	}

	/* Raw Envelope ({ Response, Message, Data }) — Same Shape As The v0.2 Operations */
	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}
