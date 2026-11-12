/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/catalog/index.ts

	(c) Sweeppea, all rights reserved.
*/

import { CatalogOperation, CatalogResource } from './types';

import {
	accountResource,
	groupResource,
	referenceResource,
	ruleExtension,
	sweepstakeExtension,
	winnerExtension,
} from './core';

import {
	campaignResource,
	codeResource,
	dripResource,
	messageResource,
	suppressionResource,
	surveyResource,
} from './engagement';

import {
	billingResource,
	calendarResource,
	invoiceResource,
	noteResource,
	ticketResource,
	todoResource,
} from './workspace';

/* Every Catalog Resource (Order Is Irrelevant: The UI Sorts By Name) */
export const catalogResources: CatalogResource[] = [
	accountResource,
	billingResource,
	calendarResource,
	campaignResource,
	codeResource,
	dripResource,
	groupResource,
	invoiceResource,
	messageResource,
	noteResource,
	referenceResource,
	ruleExtension,
	suppressionResource,
	surveyResource,
	sweepstakeExtension,
	ticketResource,
	todoResource,
	winnerExtension,
];

/* Fast Lookup: "resource:operation" → Catalog Operation */
const index = new Map<string, CatalogOperation>();

for (const resource of catalogResources) {

	for (const operation of resource.operations) {

		index.set(`${resource.value}:${operation.value}`, operation);
	}
}

export function findCatalogOperation(_resource: string, _operation: string): CatalogOperation | undefined {

	return index.get(`${_resource}:${_operation}`);
}

export * from './types';
