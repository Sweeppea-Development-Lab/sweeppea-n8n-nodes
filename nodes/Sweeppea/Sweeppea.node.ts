/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 1.0
	Path      : /nodes/Sweeppea/Sweeppea.node.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class Sweeppea implements INodeType {

	description: INodeTypeDescription = {
		displayName : 'Sweeppea',
		name        : 'sweeppea',
		icon        : 'file:sweeppea.svg',
		group       : ['transform'],
		version     : 1,
		subtitle    : '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description : 'Interact with Sweeppea API',
		defaults       : {
			name : 'Sweeppea',
		},
		inputs         : ['main'],
		outputs        : ['main'],
		credentials : [
			{
				name     : 'sweeppeaApi',
				required : true,
			},
		],
		requestDefaults: {
			baseURL : '={{$credentials.environment === "production" ? "https://api-v3.sweeppea.com": $credentials.customApiUrl}}',
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
			{
				displayName      : 'Operation',
				name             : 'operation',
				type             : 'options',
				noDataExpression : true,
				displayOptions   : {
					show: {
						resource: ['participant'],
					},
				},
				options: [
					{
						name        : 'Get Form Fields',
						value       : 'getFormFields',
						description : 'Get the entry form fields for a sweepstake',
						action      : 'Get sweepstake form fields',
					},
					{
						name        : 'Create',
						value       : 'create',
						description : 'Create a new participant in a sweepstake',
						action      : 'Create a participant',
					},
				],
				default: 'create',
			},
			{
				displayName    : 'Sweepstakes Token',
				name           : 'sweepstakesToken',
				type           : 'string',
				typeOptions    : {
					password: true,
				},
				required       : true,
				displayOptions : {
					show: {
						resource  : ['participant'],
						operation : ["getFormFields", "create"],
					},
				},
				default     : '',
				placeholder : '83d12d10-7a6d-4f99-a546-5a1c3cc267f9',
				description : 'The sweepstakes UUID token',
			},
			{
				displayName    : 'Additional Fields',
				name           : 'additionalFields',
				type           : 'collection',
				placeholder    : 'Add Field',
				default        : {},
				displayOptions : {
					show: {
						resource  : ['participant'],
						operation : ['getFormFields', 'create'],
					},
				},
				options: [
					{
						displayName : 'Use Input Data',
						name        : 'useInputData',
						type        : 'boolean',
						default     : true,
						description : 'Whether to use all data from the input item as participant data',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const items      = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource   = this.getNodeParameter('resource', 0) as string;
		const operation  = this.getNodeParameter('operation', 0) as string;

		/* Get Credentials */
		const credentials = await this.getCredentials('sweeppeaApi');
		const environment = credentials.environment as string;

		let baseUrl  : string;
		let apiToken : string;

		if (environment === 'production') {

			baseUrl  = 'https://api-v3.sweeppea.com';
			apiToken = credentials.apiToken as string;

		} else {

			baseUrl  = (credentials.customApiUrl as string) || 'http://localhost:3002';
			apiToken = credentials.apiKey as string;
		}

		if (resource === 'participant') {

			if (operation === 'getFormFields') {

				/* Get Form Fields Operation - Fetch Entry Page Fields */
				for (let i = 0; i < items.length; i++) {

					try {

						const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;

						const schemaResponse = await this.helpers.httpRequest({
							method  : 'POST',
							url     : `${baseUrl}/entrypage/fields`,
							body    : {
								SweepstakesToken: sweepstakesToken,
							},
							headers : {
								'Content-Type'  : 'application/json',
								'Authorization' : `Bearer ${apiToken}`,
							},
						});

						returnData.push({
							json       : schemaResponse as IDataObject,
							pairedItem : { item: i },
						});

					} catch (error) {

						if (error.httpCode === 404) {

							throw new NodeOperationError(
								this.getNode(),
								`Sweepstake not found. Please verify the Sweepstakes Token is correct.`,
								{ itemIndex: i },
							);
						}

						if (this.continueOnFail()) {

							const errorBody = error.response?.body || {};

							returnData.push({
								json       : Object.keys(errorBody).length > 0 ? errorBody : {
									Response  : false,
									Message   : error.message,
									itemIndex : i,
								},
								pairedItem : { item: i },
							});

							continue;
						}

						throw error;
					}
				}

			} else if (operation === 'create') {

				/* Create Participant Operation */
				for (let i = 0; i < items.length; i++) {

					try {

						const inputData        = items[i].json;
						const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;

						/* Build Request Body For API v3 */
						const requestBody = {
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

						/* Call API v3 With Bearer Auth */
						const createResponse = await this.helpers.httpRequest({
							method  : 'POST',
							url     : `${baseUrl}/participants/add`,
							body    : requestBody,
							headers : {
								'Content-Type'  : 'application/json',
								'Authorization' : `Bearer ${apiToken}`,
							},
						});

						returnData.push({
							json       : createResponse as IDataObject,
							pairedItem : { item: i },
						});

					} catch (error) {

						/* If Continue On Fail Is Enabled, Return Error As Data */
						if (this.continueOnFail()) {

							const errorBody = error.response?.body || {};

							returnData.push({
								json       : Object.keys(errorBody).length > 0 ? errorBody : {
									Response  : false,
									Message   : error.message,
									itemIndex : i,
								},
								pairedItem : { item: i },
							});

							continue;
						}

						/* Otherwise, Throw Detailed Error */
						if (error.httpCode === 404 || error.statusCode === 404) {

							throw new NodeOperationError(
								this.getNode(),
								`Sweepstake not found. Please verify the Sweepstakes Token is correct.`,
								{ itemIndex: i },
							);

						} else if (error.httpCode === 400 || error.statusCode === 400) {

							const apiError     = error.response?.body || {};
							const errorMessage = apiError.Message || apiError.message || 'Validation failed';

							throw new NodeOperationError(
								this.getNode(),
								errorMessage,
								{ itemIndex: i },
							);
						}

						throw error;
					}
				}
			}
		}

		return [returnData];
	}
}
