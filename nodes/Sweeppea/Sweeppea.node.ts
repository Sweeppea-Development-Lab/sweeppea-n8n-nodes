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

/*
 * Sweeppea Node Implementation
 * Allows creating participants in sweepstakes through N8N workflows
 */
export class Sweeppea implements INodeType {

	description: INodeTypeDescription = {
		displayName : 'Sweeppea',
		name        : 'sweeppea',
		icon        : 'file:sweeppea.svg',
		group       : ['transform'],
		version     : 1,
		subtitle    : '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description : 'Interact with Sweeppea API to manage sweepstakes and participants',
		defaults    : {
			name: 'Sweeppea',
		},
		inputs      : ['main'],
		outputs     : ['main'],
		credentials : [
			{
				name     : 'sweeppeaApi',
				required : true,
			},
		],
		requestDefaults: {
			baseURL : '={{$credentials.environment === "production" ? "https://api.sweeppea.com" : $credentials.customApiUrl}}',
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
						name        : 'Get Schema',
						value       : 'getSchema',
						description : 'Get the required fields for a sweepstake (useful for dynamic forms/chatbots)',
						action      : 'Get sweepstake schema',
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
						operation : ["getSchema", "create"],
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
						operation : ['getSchema', 'create'],
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

	/*
	 * Execute Node Logic
	 * Processes each item in the workflow and creates participants
	 */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const items      = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource   = this.getNodeParameter('resource', 0) as string;
		const operation  = this.getNodeParameter('operation', 0) as string;

		/* Get Credentials */
		const credentials = await this.getCredentials('sweeppeaApi');
		const environment = credentials.environment as string;
		const isProduction = environment === 'production';

		let baseUrl: string;

		if (isProduction) {

			baseUrl = 'https://d2e1p15gger19t.cloudfront.net/prod/api-v2';

		} else {

			baseUrl = credentials.customApiUrl as string;
		}

		if (resource === 'participant') {

		
		if (operation === 'getSchema') {

			/* Get Schema Operation - Fetch Entry Page Fields */
			for (let i = 0; i < items.length; i++) {

				try {

					const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;

					let schemaResponse: any;

					if (isProduction) {

						/* Production: API v3 with Bearer Auth */
						const apiToken = credentials.apiToken as string;

						schemaResponse = await this.helpers.httpRequest({
							method  : 'POST',
							url     : `https://api-v3.sweeppea.com/entrypage/fields`,
							body    : {
								SweepstakesToken: sweepstakesToken,
							},
							json    : true,
							headers : {
								'Content-Type'  : 'application/json',
								'Authorization' : `Bearer ${apiToken}`,
							},
						});

					} else {

						/* Development: Mock Server */
						const apiToken = credentials.apiKey as string;

						schemaResponse = await this.helpers.httpRequest({
							method  : 'POST',
							url     : `${baseUrl}/entrypage/fields`,
							body    : {
								SweepstakesToken: sweepstakesToken,
							},
							json    : true,
							headers : {
								'Content-Type'  : 'application/json',
								'Authorization' : `Bearer ${apiToken}`,
							},
						});
					}

					if (!schemaResponse.Response) {

						throw new NodeOperationError(
							this.getNode(),
							`Failed to fetch sweepstake schema: ${schemaResponse.Message || 'Unknown error'}`,
							{ itemIndex: i },
						);
					}

					/* Return Schema Data */
					returnData.push({
						json       : schemaResponse as IDataObject,
						pairedItem : { item: i },
					});

				} catch (error) {

					/* Handle API-Specific Errors */
					if (error.httpCode === 404) {

						throw new NodeOperationError(
							this.getNode(),
							`Sweepstake not found. Please verify the Sweepstakes Token is correct.`,
							{ itemIndex: i },
						);
					}

					/* If Continue On Fail Is Enabled, Add Error To Result */
					if (this.continueOnFail()) {

						returnData.push({
							json: {
								error     : error.message,
								itemIndex : i,
							},
							pairedItem: { item: i },
						});

						continue;
					}

					/* Re-Throw Error If Cannot Handle */
					throw error;
				}
			}

		} else if (operation === 'create') {

				/* Process Each Item In The Workflow */
				for (let i = 0; i < items.length; i++) {

					try {

						const inputData    = items[i].json;

						let createResponse: any;

						if (isProduction) {

							/* Production Environment - Use Real Sweeppea API Format */
							const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;
							const apiToken         = credentials.apiToken as string;

							/* Build Request Body For Real API */
							const requestBody = {
								lang             : 'en',
								source           : 'n8n-integration',
								apiToken         : apiToken,
								sweepstakesToken : sweepstakesToken,
								entryPageFields  : {
									KeyPhoneNumber : inputData.KeyPhoneNumber || '',
									KeyEmail       : inputData.KeyEmail || '',
									BonusEntries   : String(inputData.BonusEntries || 0),
									Fields         : inputData.Fields || {},
								},
							};


							/* Call Real Sweeppea API (No Auth Header Needed - Token In Body) */
							createResponse = await this.helpers.httpRequest({
								method  : 'POST',
								url     : `${baseUrl}/injectParticipant`,
								body    : requestBody,
								json    : true,
								headers : {
									'Content-Type': 'application/json',
								},
							});

				} else {

					/* Development Environment - Use Same Format As Production */
					const sweepstakesToken = this.getNodeParameter('sweepstakesToken', i) as string;
					const apiToken         = credentials.apiKey as string;

					/* Build Request Body (Same Format As Production API) */
					const requestBody = {
						lang             : 'en',
						source           : 'n8n-integration',
						apiToken         : apiToken,
						sweepstakesToken : sweepstakesToken,
						entryPageFields  : {
							KeyPhoneNumber : inputData.KeyPhoneNumber || '',
							KeyEmail       : inputData.KeyEmail || '',
							BonusEntries   : String(inputData.BonusEntries || 0),
							Fields         : inputData.Fields || {},
						},
					};

					/* Call Mock Sweeppea API (No Auth Header Needed - Token In Body) */
					createResponse = await this.helpers.httpRequest({
						method  : 'POST',
						url     : `${baseUrl}/injectParticipant`,
						body    : requestBody,
						json    : true,
						headers : {
							'Content-Type': 'application/json',
						},
					});
				}

						/* Add Result To Return Data */
						returnData.push({
							json       : createResponse as IDataObject,
							pairedItem : { item: i },
						});

					} catch (error) {

						/* Handle API-Specific Errors */
						if (error.httpCode === 404) {

							throw new NodeOperationError(
								this.getNode(),
								`Sweepstake not found. Please verify the Sweepstakes Token is correct.`,
								{ itemIndex: i },
							);

						} else if (error.httpCode === 409) {

							const errorMessage = error.response?.body?.message || 'A participant with this email already exists for this sweepstake';

							throw new NodeOperationError(
								this.getNode(),
								errorMessage,
								{ itemIndex: i },
							);

						} else if (error.httpCode === 400) {

							const errorMessage = error.response?.body?.message || 'Validation failed';
							const errors       = error.response?.body?.errors || [];
							const errorDetails = errors.length > 0 ? `\n- ${errors.join('\n- ')}` : '';

							throw new NodeOperationError(
								this.getNode(),
								`${errorMessage}${errorDetails}`,
								{ itemIndex: i },
							);
						}

						/* If Continue On Fail Is Enabled, Add Error To Result */
						if (this.continueOnFail()) {

							returnData.push({
								json: {
									error     : error.message,
									itemIndex : i,
								},
								pairedItem: { item: i },
							});

							continue;
						}

						/* Re-Throw Error If Cannot Handle */
						throw error;
					}
				}
			}
		}

		return [returnData];
	}
}
