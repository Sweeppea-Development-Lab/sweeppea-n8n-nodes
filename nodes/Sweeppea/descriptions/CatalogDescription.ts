/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/descriptions/CatalogDescription.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	INodePropertyOptions,
	INodeProperties,
} from 'n8n-workflow';

import {
	CatalogField,
	CatalogOperation,
	CatalogResource,
	catalogResources,
} from '../catalog';

/* Name Of The Collection That Holds The Optional Fields Of Every Catalog Operation */
export const CATALOG_OPTIONS_PARAMETER = 'catalogOptions';

/* Top-level Parameter Name For A Body Key: SweepstakesToken → sweepstakesToken */
export function catalogParameterName(_key: string): string {

	return _key.charAt(0).toLowerCase() + _key.slice(1);
}

function byName<T extends { name: string }>(_a: T, _b: T): number {

	return _a.name.localeCompare(_b.name, 'en', { sensitivity: 'base' });
}

type DisplayShow = { [key: string]: Array<string | number | boolean> };

/* Converts One Catalog Field Into An n8n Property */
function toProperty(_field: CatalogField, _name: string, _show?: DisplayShow): INodeProperties {

	const property: INodeProperties = {
		displayName : _field.displayName,
		name        : _name,
		type        : 'string',
		default     : '',
	};

	if (_field.description) {

		property.description = _field.description;
	}

	if (_field.placeholder) {

		property.placeholder = _field.placeholder;
	}

	if (_field.required) {

		property.required = true;
	}

	if (_show) {

		property.displayOptions = { show: _show };
	}

	switch (_field.type) {

		case 'multiline':
			property.typeOptions = { rows: 4 };
			property.default     = (_field.default as string) ?? '';
			break;

		case 'number':
			property.type    = 'number';
			property.default = (_field.default as number) ?? 0;

			if (_field.min !== undefined || _field.max !== undefined) {

				property.typeOptions = {};

				if (_field.min !== undefined) property.typeOptions.minValue = _field.min;
				if (_field.max !== undefined) property.typeOptions.maxValue = _field.max;
			}
			break;

		case 'boolean':
			property.type    = 'boolean';
			property.default = (_field.default as boolean) ?? false;
			break;

		case 'options':
			property.type    = 'options';
			property.options = [...(_field.options ?? [])].sort(byName) as INodePropertyOptions[];
			property.default = _field.default ?? (_field.options?.[0]?.value ?? '');
			break;

		case 'json':
			property.type    = 'json';
			property.default = (_field.default as string) ?? '{}';
			break;

		case 'date':
		case 'dateTime':
			property.type    = 'dateTime';
			property.default = '';
			break;

		case 'sweepstake':
			property.type        = 'options';
			property.typeOptions = { loadOptionsMethod: 'getSweepstakes' };
			break;

		case 'group':
			property.type        = 'options';
			property.typeOptions = { loadOptionsMethod: 'getGroups', loadOptionsDependsOn: ['sweepstakesToken'] };
			property.description = `${_field.description ?? 'The group'}. Choose from the list, or specify a Group Token using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.`;
			break;

		case 'groupOrAll':
			property.type        = 'options';
			property.typeOptions = { loadOptionsMethod: 'getGroupsWithAll', loadOptionsDependsOn: ['sweepstakesToken'] };
			property.default     = 'allgroups';
			property.description = `${_field.description ?? 'The group'}. Choose from the list, or specify a Group Token using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.`;
			break;

		case 'timezone':
			property.type        = 'options';
			property.typeOptions = { loadOptionsMethod: 'getTimezones' };
			break;

		case 'collection':
			property.type        = 'collection';
			property.placeholder = 'Add Field';
			property.default     = {};
			property.options     = (_field.fields ?? []).map(_child => toProperty(_child, _child.key)).sort(byName);
			break;

		case 'itemList':
			property.type        = 'fixedCollection';
			property.placeholder = 'Add Item';
			property.default     = {};
			property.typeOptions = { multipleValues: true };
			property.options     = [
				{
					name        : 'item',
					displayName : 'Item',
					values      : (_field.fields ?? []).map(_child => toProperty(_child, _child.key)),
				},
			];
			break;

		case 'stringList':
		case 'string':
		default:
			property.default = (_field.default as string) ?? '';
			break;
	}

	return property;
}

/* Builds Every Property (Top-level Fields, Optional Collection, Pagination) Of One Operation */
function operationProperties(_resource: string, _operation: CatalogOperation): INodeProperties[] {

	const show: DisplayShow = {
		resource  : [_resource],
		operation : [_operation.value],
	};

	const properties: INodeProperties[] = [];

	for (const field of _operation.fields ?? []) {

		properties.push(toProperty(field, catalogParameterName(field.key), show));
	}

	if (_operation.pagination) {

		properties.push(
			{
				displayName    : 'Return All',
				name           : 'returnAll',
				type           : 'boolean',
				displayOptions : { show },
				default        : false,
				description    : 'Whether to return all results or only up to a given limit',
			},
			{
				displayName    : 'Limit',
				name           : 'limit',
				type           : 'number',
				displayOptions : { show: { ...show, returnAll: [false] } },
				typeOptions    : { minValue: 1 },
				default        : 50,
				description    : 'Max number of results to return',
			},
		);
	}

	if (_operation.optional?.length) {

		properties.push({
			displayName    : _operation.optionalLabel ?? 'Additional Fields',
			name           : CATALOG_OPTIONS_PARAMETER,
			type           : 'collection',
			placeholder    : _operation.optionalLabel === 'Filters' ? 'Add Filter' : (_operation.optionalLabel === 'Options' ? 'Add Option' : 'Add Field'),
			displayOptions : { show },
			default        : {},
			options        : _operation.optional.map(_field => toProperty(_field, _field.key)).sort(byName),
		});
	}

	return properties;
}

/* One Operation Option For An Operation Selector */
function toOperationOption(_operation: CatalogOperation): INodePropertyOptions {

	return {
		name        : _operation.name,
		value       : _operation.value,
		description : _operation.description,
		action      : _operation.action,
	};
}

/* Resources New In v0.3 (Shown In The Resource Selector Next To The v0.2 Ones) */
export const catalogResourceOptions: INodePropertyOptions[] = catalogResources
	.filter(_resource => !_resource.extendsExisting)
	.map(_resource => ({ name: _resource.name, value: _resource.value }));

/* Operation Selectors Of The Resources New In v0.3 */
export const catalogOperationSelectors: INodeProperties[] = catalogResources
	.filter(_resource => !_resource.extendsExisting)
	.map((_resource: CatalogResource) => {

		const selector: INodeProperties = {
			displayName      : 'Operation',
			name             : 'operation',
			type             : 'options',
			noDataExpression : true,
			displayOptions   : { show: { resource: [_resource.value] } },
			options          : _resource.operations.map(toOperationOption).sort(byName),
			default          : '',
		};

		/* Assigned After The Literal So The Default Can Come From The Catalog */
		selector.default = _resource.defaultOperation;

		return selector;
	});

/* Fields Of Every Catalog Operation (New Resources And New Ops Of v0.2 Resources) */
export const catalogFields: INodeProperties[] = catalogResources.flatMap(
	_resource => _resource.operations.flatMap(_operation => operationProperties(_resource.value, _operation)),
);

/*
 * Appends The Catalog Operations Of A v0.2 Resource To Its Hand-written
 * Operation Selector. The Original Options, Values And Default Stay Untouched
 */
export function withCatalogOperations(_selectors: INodeProperties[], _resource: string): INodeProperties[] {

	const extension = catalogResources.find(_r => _r.value === _resource && _r.extendsExisting);

	if (!extension) {

		return _selectors;
	}

	return _selectors.map(_selector => {

		if (_selector.name !== 'operation') {

			return _selector;
		}

		const options = [
			...((_selector.options ?? []) as INodePropertyOptions[]),
			...extension.operations.map(toOperationOption),
		].sort(byName);

		return { ..._selector, options };
	});
}
