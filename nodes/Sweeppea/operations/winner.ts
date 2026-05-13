/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/operations/winner.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

import { sweeppeaApiRequest } from '../GenericFunctions';

const WINNERS_PAGE_SIZE = 100;

/*
 * Draw Winners Operation
 * Picks N Winners From The Sweepstake Using Weighted Random Selection
 */
export async function draw(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken    = this.getNodeParameter('sweepstakesToken', i) as string;
	const howManyWinnersToPick = this.getNodeParameter('howManyWinnersToPick', i) as number;
	const additional           = this.getNodeParameter('drawAdditionalFields', i, {}) as IDataObject;

	const body: IDataObject = {
		sweepstakesToken,
		howManyWinnersToPick,
		...additional,
	};

	const response = await sweeppeaApiRequest.call(this, 'POST', '/winners/draw', body);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Get Many Winners Operation
 * Paginated List Of Past Winners; Optional Search By Email Or Phone
 */
export async function getMany(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;
	const returnAll        = this.getNodeParameter('returnAll', i) as boolean;
	const filters          = this.getNodeParameter('winnerFilters', i, {}) as IDataObject;

	const baseBody: IDataObject = {
		sweepstakesToken,
		itemsPerPage: WINNERS_PAGE_SIZE,
	};

	if (filters.search) {

		baseBody.search = filters.search;
	}

	const limit                  = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const results: IDataObject[] = [];
	let page                     = 1;

	while (true) {

		const response = await sweeppeaApiRequest.call(
			this,
			'POST',
			'/winners/fetch',
			{ ...baseBody, page },
		);

		const winners = ((response.Winners as IDataObject[]) ?? []);

		if (winners.length === 0) {

			break;
		}

		results.push(...winners);

		if (limit !== undefined && results.length >= limit) {

			results.length = limit;

			break;
		}

		if (winners.length < WINNERS_PAGE_SIZE) {

			break;
		}

		page++;
	}

	return results.map(winner => ({
		json       : winner,
		pairedItem : { item: i },
	}));
}
