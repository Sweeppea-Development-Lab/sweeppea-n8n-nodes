/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/Sweeppea.node.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import {
	buildErrorReturnData,
	mapApiError,
} from './GenericFunctions';

import {
	participantFields,
	participantOperations,
} from './descriptions/ParticipantDescription';

import * as participantOps from './operations/participant';

export class Sweeppea implements INodeType {

	description: INodeTypeDescription = {
		displayName : 'Sweeppea',
		name        : 'sweeppea',
		icon        : 'file:sweeppea.svg',
		group       : ['transform'],
		version     : 1,
		subtitle    : '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description : 'Interact with the Sweeppea API',
		defaults    : {
			name: 'Sweeppea',
		},
		inputs         : [NodeConnectionTypes.Main],
		outputs        : [NodeConnectionTypes.Main],
		credentials    : [
			{
				name     : 'sweeppeaApi',
				required : true,
			},
		],
		requestDefaults: {
			baseURL : '={{$credentials.environment === "production" ? "https://api-v3.sweeppea.com" : $credentials.customApiUrl}}',
			headers : {
				Accept         : 'application/json',
				'Content-Type' : 'application/json',
			},
		},
		properties: [
			{
				displayName      : 'Resource',
				name             : 'resource',
				type             : 'options',
				noDataExpression : true,
				options          : [
					{
						name  : 'Participant',
						value : 'participant',
					},
				],
				default: 'participant',
			},
			...participantOperations,
			...participantFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const items      = this.getInputData();
		const returnData : INodeExecutionData[] = [];
		const resource   = this.getNodeParameter('resource', 0) as string;
		const operation  = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {

			try {

				let result: INodeExecutionData;

				if (resource === 'participant') {

					if (operation === 'getFormFields') {

						result = await participantOps.getFormFields.call(this, i);

					} else if (operation === 'create') {

						result = await participantOps.create.call(this, i);

					} else {

						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation "${operation}" for resource "${resource}"`,
							{ itemIndex: i },
						);
					}

				} else {

					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				returnData.push(result);

			} catch (error) {

				if (this.continueOnFail()) {

					returnData.push(buildErrorReturnData(error as JsonObject, i));

					continue;
				}

				/* mapApiError() Maps Raw API Errors To NodeOperation/ApiError */
				/* And Passes Through Already-typed Errors Unchanged           */
				throw mapApiError(this.getNode(), error, i);
			}
		}

		return [returnData];
	}
}
