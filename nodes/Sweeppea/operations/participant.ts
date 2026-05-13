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
} from 'n8n-workflow';

import { sweeppeaApiRequest } from '../GenericFunctions';

/*
 * Get Form Fields Operation
 * Fetches The Entry Page Schema For A Sweepstake So Downstream Steps
 * Can Build Dynamic Forms / Prompts
 */
export async function getFormFields(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData> {

	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;

	const response = await sweeppeaApiRequest.call(
		this,
		'POST',
		'/entrypage/fields',
		{ SweepstakesToken: sweepstakesToken },
	);

	return {
		json       : response,
		pairedItem : { item: i },
	};
}

/*
 * Create Participant Operation
 * Registers A New Participant Using The Input Item's Data Mapped
 * Into The API v3 Body Shape
 */
export async function create(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData> {

	const items            = this.getInputData();
	const inputData        = items[i].json as IDataObject;
	const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;

	/* Build Request Body For API V3 */
	const body: IDataObject = {
		lang             : inputData.lang || 'EN',
		source           : inputData.source || 'n8n-integration',
		sweepstakesToken : sweepstakesToken,
		entryPageFields  : {
			KeyPhoneNumber : inputData.KeyPhoneNumber || '',
			KeyEmail       : inputData.KeyEmail || '',
			BonusEntries   : inputData.BonusEntries || 0,
			Fields         : inputData.Fields || {},
		},
	};

	const response = await sweeppeaApiRequest.call(
		this,
		'POST',
		'/participants/add',
		body,
	);

	return {
		json       : response,
		pairedItem : { item: i },
	};
}
