/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/operations/sweepstake.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

import { sweeppeaApiRequest } from '../GenericFunctions';

/*
 * Create Sweepstake Operation
 * Spawns A New Sweepstake With Entry Pages, Groups, And Default Settings
 */
export async function create(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const additional = this.getNodeParameter('createAdditionalFields', i, {}) as IDataObject;

	const body: IDataObject = {
		SweepstakesName : this.getNodeParameter('sweepstakesName', i) as string,
		SweepstakesType : this.getNodeParameter('sweepstakesType', i) as number,
		Handler         : this.getNodeParameter('handler', i) as string,
		StartDate       : this.getNodeParameter('startDate', i) as string,
		EndDate         : this.getNodeParameter('endDate', i) as string,
		StartTime       : this.getNodeParameter('startTime', i) as string,
		EndTime         : this.getNodeParameter('endTime', i) as string,
		...additional,
	};

	const response = await sweeppeaApiRequest.call(this, 'POST', '/sweepstakes/create', body);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Get Many Sweepstakes Operation
 * Returns Every Sweepstake Linked To The Authenticated Account
 * The API Does Not Paginate Or Filter This Endpoint
 */
export async function getMany(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const response = await sweeppeaApiRequest.call(this, 'POST', '/sweepstakes/fetch', {});

	const data = response.Data;

	if (Array.isArray(data)) {

		return data.map(item => ({
			json       : item as IDataObject,
			pairedItem : { item: i },
		}));
	}

	/* Fallback: Return The Full Response Envelope If Shape Diverges */
	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Update Sweepstake Operation
 * Patches Name / Dates / Times; At Least One Field Must Be Set
 */
export async function update(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;
	const updateFields     = this.getNodeParameter('updateFields', i, {}) as IDataObject;

	const body: IDataObject = {
		SweepstakesToken: sweepstakesToken,
		...updateFields,
	};

	const response = await sweeppeaApiRequest.call(this, 'POST', '/sweepstakes/update', body);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Pause Sweepstake Operation
 * Toggles Status To Inactive Without Deleting Data
 */
export async function pause(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;

	const response = await sweeppeaApiRequest.call(
		this,
		'POST',
		'/sweepstakes/pause',
		{ SweepstakesToken: sweepstakesToken },
	);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Unpause Sweepstake Operation
 * Re-activates A Paused Sweepstake
 */
export async function unpause(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;

	const response = await sweeppeaApiRequest.call(
		this,
		'POST',
		'/sweepstakes/unpause',
		{ SweepstakesToken: sweepstakesToken },
	);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Clone Sweepstake Operation
 * Creates A New Sweepstake Copied From An Existing One (Identified By Handler)
 */
export async function clone(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const body: IDataObject = {
		Handler         : this.getNodeParameter('cloneSourceHandler', i) as string,
		HandlerNew      : this.getNodeParameter('cloneNewHandler', i) as string,
		SweepstakesName : this.getNodeParameter('cloneNewName', i) as string,
		StartDate       : this.getNodeParameter('cloneStartDate', i) as string,
		EndDate         : this.getNodeParameter('cloneEndDate', i) as string,
		StartTime       : this.getNodeParameter('cloneStartTime', i) as string,
		EndTime         : this.getNodeParameter('cloneEndTime', i) as string,
	};

	const response = await sweeppeaApiRequest.call(this, 'POST', '/sweepstakes/clone', body);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}
