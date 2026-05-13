/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/operations/rule.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
} from 'n8n-workflow';

import { sweeppeaApiRequest } from '../GenericFunctions';

/*
 * Create Rule Operation
 * Submits An Official Rules Document (HTML) For A Sweepstake.
 * The First Rule Created Is Marked Primary; Subsequent Are Secondary
 */
export async function create(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {

	const body: IDataObject = {
		SweepstakesToken : this.getNodeParameter('sweepstakesToken', i) as string,
		Title            : this.getNodeParameter('ruleTitle', i) as string,
		DocumentContent  : this.getNodeParameter('ruleDocumentContent', i) as string,
	};

	const response = await sweeppeaApiRequest.call(this, 'POST', '/rules/create', body);

	return [{
		json       : response,
		pairedItem : { item: i },
	}];
}
