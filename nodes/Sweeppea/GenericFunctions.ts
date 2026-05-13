/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.2.0
	Path      : /nodes/Sweeppea/GenericFunctions.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INode,
	INodeExecutionData,
	JsonObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

const PRODUCTION_BASE_URL = 'https://api-v3.sweeppea.com';
const DEFAULT_DEV_BASE_URL = 'http://localhost:3002';

/* Resolve The Base URL According To The Selected Environment */
async function resolveBaseUrl(this: IExecuteFunctions | ILoadOptionsFunctions): Promise<string> {

	const credentials = await this.getCredentials('sweeppeaApi');

	if (credentials.environment === 'production') {

		return PRODUCTION_BASE_URL;
	}

	return (credentials.customApiUrl as string) || DEFAULT_DEV_BASE_URL;
}

/*
 * Generic HTTP Request Helper For Sweeppea API V3
 * Delegates authentication to the SweeppeaApi credential so the bearer
 * token (apiToken | apiKey) is injected by the credential provider
 */
export async function sweeppeaApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
): Promise<IDataObject> {

	const baseUrl = await resolveBaseUrl.call(this);

	const options: IHttpRequestOptions = {
		method,
		url     : `${baseUrl}${endpoint}`,
		body,
		headers : {
			Accept         : 'application/json',
			'Content-Type' : 'application/json',
		},
		json    : true,
	};

	const response = await this.helpers.httpRequestWithAuthentication.call(
		this,
		'sweeppeaApi',
		options,
	);

	return response as IDataObject;
}

/*
 * Builds The Error Return Data Used When `continueOnFail` Is Enabled
 * Preserves The Original Shape: When The API Returned A Body, We Return It
 * As-Is So Downstream Workflow Logic Can Branch On `Response: false`
 */
export function buildErrorReturnData(error: JsonObject, itemIndex: number): INodeExecutionData {

	const errorBody = (
		((error as IDataObject).response as IDataObject | undefined)?.body
		|| ((error as IDataObject).cause as IDataObject | undefined)?.error
		|| {}
	) as IDataObject;

	const hasBody = Object.keys(errorBody).length > 0;

	return {
		json: hasBody
			? errorBody
			: {
					Response  : false,
					Message   : (error as IDataObject).message || 'Unknown error',
					itemIndex,
				},
		pairedItem: { item: itemIndex },
	};
}

/*
 * Reads The HTTP Status From An Error Thrown By `httpRequestWithAuthentication`
 * The Field Can Live Under `httpCode` (string) Or `statusCode` (number)
 * Depending On The Internal n8n Wrapper
 */
export function getErrorHttpCode(error: JsonObject): number | undefined {

	const raw = (error as IDataObject).httpCode ?? (error as IDataObject).statusCode;

	if (raw === undefined || raw === null) {

		return undefined;
	}

	const parsed = typeof raw === 'number' ? raw : Number(raw);

	return Number.isFinite(parsed) ? parsed : undefined;
}

/*
 * Wraps A Raw API Error Into A Typed `NodeOperationError` / `NodeApiError`
 * So Callers Never Re-throw The Raw Error From `httpRequestWithAuthentication`
 * Centralizes The 404 ("Sweepstake Not Found") And 400 (Validation) Mappings
 * Passes Through Already-typed Errors Unchanged To Avoid Double-Wrapping
 */
export function mapApiError(
	node: INode,
	error: unknown,
	itemIndex: number,
): NodeApiError | NodeOperationError {

	if (error instanceof NodeOperationError || error instanceof NodeApiError) {

		return error;
	}

	const errorObj = error as JsonObject;
	const httpCode = getErrorHttpCode(errorObj);

	if (httpCode === 404) {

		return new NodeOperationError(
			node,
			'Sweepstake not found. Please verify the Sweepstakes Token is correct.',
			{ itemIndex },
		);
	}

	if (httpCode === 400) {

		const apiError = (
			((errorObj as IDataObject).response as IDataObject | undefined)?.body
			|| ((errorObj as IDataObject).cause as IDataObject | undefined)?.error
			|| {}
		) as IDataObject;

		const message = (apiError.Message || apiError.message || 'Validation failed') as string;

		return new NodeOperationError(node, message, { itemIndex });
	}

	return new NodeApiError(node, errorObj, { itemIndex });
}
