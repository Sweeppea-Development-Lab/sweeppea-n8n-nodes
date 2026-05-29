/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/operations/participant.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

import { sweeppeaApiRequest } from '../GenericFunctions';

const PARTICIPANTS_PAGE_SIZE = 20;

/*
 * Helper: Pulls Participants Page By Page Until `limit` Or All Pages Are
 * Consumed. The Sweeppea API Returns A Fixed 20 Per Page Via `page`
 */
async function paginateParticipants(
	this: IExecuteFunctions,
	baseBody: IDataObject,
	limit: number | undefined,
): Promise<IDataObject[]> {

	const results: IDataObject[] = [];
	let page                     = 1;

	while (true) {

		const response = await sweeppeaApiRequest.call(
			this,
			'POST',
			'/participants/fetch',
			{ ...baseBody, page },
		);

		const participants = ((response.Participants as IDataObject[]) ?? []);

		if (participants.length === 0) {

			break;
		}

		results.push(...participants);

		if (limit !== undefined && results.length >= limit) {

			results.length = limit;

			break;
		}

		const pagination = response.Pagination as IDataObject | undefined;
		const totalPages = pagination ? Number(pagination.TotalPages) : undefined;

		if (totalPages !== undefined && page >= totalPages) {

			break;
		}

		if (participants.length < PARTICIPANTS_PAGE_SIZE) {

			break;
		}

		page++;
	}

	return results;
}

/*
 * Get Form Fields Operation
 * Fetches The Entry Page Schema For A Sweepstake So Downstream Steps
 * Can Build Dynamic Forms / Prompts
 */
export async function getFormFields(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;

	const response = await sweeppeaApiRequest.call(
		this,
		'POST',
		'/entrypage/fields',
		{ SweepstakesToken: sweepstakesToken },
	);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Create Participant Operation
 * Registers A New Participant. Reads Top-Level Node Params (Email,
 * Phone, BonusEntries, CustomFields, Create Options) When Set, And
 * Falls Back To items[i].json For Backwards Compat With v0.1 Workflows.
 * The Explicit-Params Path Is What Lets The AI Agent Fill Inputs Via
 * $fromAI() When This Node Runs As A Tool
 */
export async function create(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const items            = this.getInputData();
	const inputData        = (items[i]?.json ?? {}) as IDataObject;
	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;

	/* Read Explicit Node Params (Empty Defaults Mean "Use Input Data") */
	const explicitEmail       = this.getNodeParameter('KeyEmail', i, '') as string;
	const explicitPhone       = this.getNodeParameter('KeyPhoneNumber', i, '') as string;
	const explicitBonus       = this.getNodeParameter('BonusEntries', i, 0) as number;
	const explicitCustomRaw   = this.getNodeParameter('CustomFields', i, {}) as string | IDataObject;
	const createOptions       = this.getNodeParameter('createOptions', i, {}) as IDataObject;

	/* Parse Custom Fields JSON (Accepts Object Or String Per n8n json type) */
	let explicitCustomFields: IDataObject = {};

	if (typeof explicitCustomRaw === 'string') {

		const trimmed = explicitCustomRaw.trim();

		if (trimmed && trimmed !== '{}') {

			try {

				explicitCustomFields = JSON.parse(trimmed) as IDataObject;

			} catch {

				throw new NodeOperationError(
					this.getNode(),
					'Custom Fields must be a valid JSON object',
					{ itemIndex: i },
				);
			}
		}

	} else if (explicitCustomRaw && typeof explicitCustomRaw === 'object') {

		explicitCustomFields = explicitCustomRaw;
	}

	/* Priority: Explicit Param > Input Item > Default */
	const inputFields = (inputData.Fields ?? {}) as IDataObject;
	const KeyEmail = explicitEmail || (inputData.KeyEmail as string) || '';
	const KeyPhoneNumber = explicitPhone || (inputData.KeyPhoneNumber as string) || '';
	const BonusEntries = explicitBonus || Number(inputData.BonusEntries ?? 0);
	const Fields = Object.keys(explicitCustomFields).length > 0
		? explicitCustomFields
		: inputFields;
	const lang = (createOptions.lang as string) || (inputData.lang as string) || 'EN';
	const source = (createOptions.source as string) || (inputData.source as string) || 'n8n-integration';

	const body: IDataObject = {
		lang             : lang,
		source           : source,
		sweepstakesToken : sweepstakesToken,
		entryPageFields  : {
			KeyPhoneNumber : KeyPhoneNumber,
			KeyEmail       : KeyEmail,
			BonusEntries   : BonusEntries,
			Fields         : Fields,
		},
	};

	const response = await sweeppeaApiRequest.call(
		this,
		'POST',
		'/participants/add',
		body,
	);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Get Many Participants Operation
 * Paginated List Of Participants With Optional Search + Date Filters
 */
export async function getMany(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;
	const returnAll        = this.getNodeParameter('returnAll', i) as boolean;
	const filters          = this.getNodeParameter('getManyFilters', i, {}) as IDataObject;

	const baseBody: IDataObject = { sweepstakesToken };

	if (filters.search) {

		baseBody.search = filters.search;
	}

	if (filters.optInDate) {

		baseBody.optInDate = filters.optInDate;
	}

	if (filters.startDate) {

		baseBody.startDate = filters.startDate;
	}

	if (filters.endDate) {

		baseBody.endDate = filters.endDate;
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);

	const participants = await paginateParticipants.call(this, baseBody, limit);

	return participants.map(participant => ({
		json       : participant,
		pairedItem : { item: i },
	}));
}

/*
 * Get Single Participant Operation
 * Searches By Email, Phone Or ParticipantToken (User Picks One)
 */
export async function get(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;
	const searchBy         = this.getNodeParameter('searchBy', i) as string;

	const body: IDataObject = { SweepstakesToken: sweepstakesToken };

	if (searchBy === 'keyEmail') {

		body.KeyEmail = this.getNodeParameter('getKeyEmail', i) as string;

	} else if (searchBy === 'keyPhoneNumber') {

		body.KeyPhoneNumber = this.getNodeParameter('getKeyPhoneNumber', i) as string;

	} else if (searchBy === 'participantToken') {

		body.ParticipantToken = this.getNodeParameter('getParticipantToken', i) as string;
	}

	const response = await sweeppeaApiRequest.call(
		this,
		'POST',
		'/participants/single',
		body,
	);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Count Participants Operation
 * Returns Aggregate Counts (Participants / AMOE / Opt-Outs / Total)
 */
export async function count(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;
	const filterType       = this.getNodeParameter('countFilterType', i) as string;
	const dateRange        = this.getNodeParameter('countDateRange', i, {}) as IDataObject;

	const body: IDataObject = {
		SweepstakesToken : sweepstakesToken,
		FilterType       : filterType,
	};

	if (dateRange.startDate) {

		body.StartDate = dateRange.startDate;
	}

	if (dateRange.endDate) {

		body.EndDate = dateRange.endDate;
	}

	const response = await sweeppeaApiRequest.call(
		this,
		'POST',
		'/participants/count',
		body,
	);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}

/*
 * Delete Participant Operation
 * Removes A Participant From Whichever Collection They Are In
 * Uses HTTP DELETE (Per API V3 Spec, Unlike Other Endpoints)
 */
export async function remove(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;
	const participantToken = this.getNodeParameter('deleteParticipantToken', i) as string;

	const response = await sweeppeaApiRequest.call(
		this,
		'DELETE',
		'/participants/delete',
		{
			SweepstakesToken : sweepstakesToken,
			ParticipantToken : participantToken,
		},
	);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}
