/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/methods/loadOptions.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import { sweeppeaApiRequest } from '../GenericFunctions';

function asList(_response: IDataObject): IDataObject[] {

	return Array.isArray(_response.Data) ? (_response.Data as IDataObject[]) : [];
}

function byName(_a: INodePropertyOptions, _b: INodePropertyOptions): number {

	return _a.name.localeCompare(_b.name, 'en', { sensitivity: 'base' });
}

/* Sweepstakes Of The Account → "Name (HANDLER)" */
export async function getSweepstakes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

	const response = await sweeppeaApiRequest.call(this, 'POST', '/sweepstakes/fetch', {});

	return asList(response)
		.map(_sweepstake => ({
			name        : `${_sweepstake.SweepstakesName} (${_sweepstake.Handler})`,
			value       : _sweepstake.SweepstakesToken as string,
			description : _sweepstake.Archived ? 'Archived' : undefined,
		}))
		.sort(byName);
}

/* Groups Of The Sweepstake Currently Selected In The Node */
export async function getGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

	const sweepstakesToken = this.getCurrentNodeParameter('sweepstakesToken') as string | undefined;

	if (!sweepstakesToken || sweepstakesToken.startsWith('=')) {

		return [];
	}

	const response = await sweeppeaApiRequest.call(this, 'POST', '/groups/fetch', { SweepstakesToken: sweepstakesToken });

	return asList(response)
		.map(_group => ({
			name  : _group.Primary ? `${_group.GroupName} (primary)` : (_group.GroupName as string),
			value : _group.GroupToken as string,
		}))
		.sort(byName);
}

/* Same As getGroups, With An "All Groups" Entry First */
export async function getGroupsWithAll(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

	const groups = await getGroups.call(this);

	return [{ name: 'All Groups', value: 'allgroups' }, ...groups];
}

/* Timezones Accepted By Scheduled Drawings → Data.Timezones[] { TimezoneId, Text } */
export async function getTimezones(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {

	const response = await sweeppeaApiRequest.call(this, 'POST', '/tools/timezones', {});
	const data     = (response.Data ?? {}) as IDataObject;
	const list     = Array.isArray(data) ? (data as IDataObject[]) : ((data.Timezones as IDataObject[] | undefined) ?? []);

	return list.map(_timezone => ({
		name  : (_timezone.Text as string) || (_timezone.Timezone as string) || String(_timezone.TimezoneId),
		value : _timezone.TimezoneId as number,
	}));
}
