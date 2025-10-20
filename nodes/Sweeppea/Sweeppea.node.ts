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

/**
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
			baseURL : '={{$credentials.environment === "production" ? "https://api.sweeppea.com" : $credentials.environment === "staging" ? "https://staging-api.sweeppea.com" : $credentials.customApiUrl}}',
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
				name        : 'Check Participant',
				value       : 'checkParticipant',
				description : 'Check if an email is already registered in a sweepstake',
				action      : 'Check if participant exists',
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
				displayName    : 'Sweepstake ID',
				name           : 'sweepstakeId',
				type           : 'string',
				required       : true,
				displayOptions : {
					show: {
						resource  : ['participant'],
						operation : ['getSchema', 'checkParticipant', 'create'],
					},
				},
				default     : '',
				placeholder : 'summer_2025',
				description : 'The unique identifier of the sweepstake',
			},
		{
			displayName    : 'Email or Phone',
			name           : 'emailOrPhone',
			type           : 'string',
			required       : true,
			displayOptions : {
				show: {
					resource  : ['participant'],
					operation : ['checkParticipant'],
				},
			},
			default     : '',
			placeholder : 'user@example.com or 5551234567',
			description : 'The email address or phone number (10 digits) to check',
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
						operation : ['getSchema', 'checkParticipant', 'create'],
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

	/**
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

		let baseUrl: string;

		if (environment === 'production') {

			baseUrl = 'https://api.sweeppea.com';

		} else if (environment === 'staging') {

			baseUrl = 'https://staging-api.sweeppea.com';

		} else {

			baseUrl = credentials.customApiUrl as string;
		}

		if (resource === 'participant') {

			
		if (operation === 'getSchema') {

			/* Get Schema Operation - Returns Fields Structure */
			for (let i = 0; i < items.length; i++) {

				try {

					const sweepstakeId = this.getNodeParameter('sweepstakeId', i) as string;

					/* Fetch Sweepstake Schema */
					const schemaUrl      = `${baseUrl}/api-v1/n8n/sweepstakes/${sweepstakeId}/schema`;
					const schemaResponse = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'sweeppeaApi',
						{
							method : 'GET',
							url    : schemaUrl,
							json   : true,
						},
					);

					if (!schemaResponse.success) {

						throw new NodeOperationError(
							this.getNode(),
							`Failed to fetch sweepstake schema: ${schemaResponse.message || 'Unknown error'}`,
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
							`Sweepstake not found. Please verify the Sweepstake ID is correct.`,
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

		} else if (operation === 'checkParticipant') {

			/* Check Participant Operation - Verify If Email Or Phone Exists */
			for (let i = 0; i < items.length; i++) {

				try {

					const sweepstakeId = this.getNodeParameter('sweepstakeId', i) as string;
					const emailOrPhone = this.getNodeParameter('emailOrPhone', i) as string;

					/* Determine If Input Is Email Or Phone */
					const isEmail    = emailOrPhone.includes('@');
					const queryParam = isEmail ? `email=${encodeURIComponent(emailOrPhone)}` : `phone=${emailOrPhone}`;

					/* Validate Phone Format If Not Email */
					if (!isEmail && emailOrPhone.length !== 10) {

						throw new NodeOperationError(
							this.getNode(),
							`Phone number must be exactly 10 digits. Received: ${emailOrPhone.length} characters.`,
							{ itemIndex: i },
						);
					}

					/* Call Check Participant Endpoint */
					const checkUrl      = `${baseUrl}/api-v1/n8n/sweepstakes/${sweepstakeId}/participants/check?${queryParam}`;
					const checkResponse = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'sweeppeaApi',
						{
							method : 'GET',
							url    : checkUrl,
							json   : true,
						},
					);

					if (!checkResponse.success) {

						throw new NodeOperationError(
							this.getNode(),
							`Failed to check participant: ${checkResponse.message || 'Unknown error'}`,
							{ itemIndex: i },
						);
					}

					/* Return Check Result */
					returnData.push({
						json       : checkResponse as IDataObject,
						pairedItem : { item: i },
					});

				} catch (error) {

					/* Handle API-Specific Errors */
					if (error.httpCode === 404) {

						throw new NodeOperationError(
							this.getNode(),
							`Sweepstake not found. Please verify the Sweepstake ID is correct.`,
							{ itemIndex: i },
						);

					} else if (error.httpCode === 400) {

						const errorMessage = error.response?.body?.message || 'Bad Request';

						throw new NodeOperationError(
							this.getNode(),
							errorMessage,
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

						const sweepstakeId     = this.getNodeParameter('sweepstakeId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as {
							useInputData?: boolean;
						};

						const useInputData = additionalFields.useInputData !== false;

						/* Step 1: Fetch Sweepstake Schema */
						const schemaUrl      = `${baseUrl}/api-v1/n8n/sweepstakes/${sweepstakeId}/schema`;
						const schemaResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sweeppeaApi',
							{
								method : 'GET',
								url    : schemaUrl,
								json   : true,
							},
						);

						if (!schemaResponse.success) {

							throw new NodeOperationError(
								this.getNode(),
								`Failed to fetch sweepstake schema: ${schemaResponse.message || 'Unknown error'}`,
								{ itemIndex: i },
							);
						}

						const schema = schemaResponse as {
							success      : boolean;
							sweepstakeId : string;
							name         : string;
							status       : string;
							fields       : Array<{
								name         : string;
								displayName  : string;
								type         : string;
								required     : boolean;
								validation?  : Record<string, unknown>;
								options?     : string[];
							}>;
						};

						/* Step 2: Build Participant Data From Input */
						const inputData                          = items[i].json;
						const participantData: Record<string, unknown> = {};

						if (useInputData) {

							/* Use All Data From Input */
							for (const field of schema.fields) {

								const fieldName = field.name;

								if (inputData[fieldName] !== undefined) {

									participantData[fieldName] = inputData[fieldName];
								}
							}
						}

						/* Step 3: Validate Required Fields */
						const missingFields: string[] = [];

						for (const field of schema.fields) {

							if (field.required && !participantData[field.name]) {

								missingFields.push(field.displayName);
							}
						}

						if (missingFields.length > 0) {

							throw new NodeOperationError(
								this.getNode(),
								`Missing required fields for sweepstake '${schema.name}': ${missingFields.join(', ')}. Please ensure these fields are present in the input data.`,
								{ itemIndex: i },
							);
						}

						/* Step 4: Create Participant */
						const createUrl      = `${baseUrl}/api-v1/n8n/participants`;
						const createResponse = await this.helpers.httpRequestWithAuthentication.call(
							this,
							'sweeppeaApi',
							{
								method : 'POST',
								url    : createUrl,
								body   : {
									sweepstakeId : sweepstakeId,
									data         : participantData,
								},
								json: true,
							},
						);

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
								`Sweepstake not found. Please verify the Sweepstake ID is correct.`,
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
