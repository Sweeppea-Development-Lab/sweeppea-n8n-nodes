/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.1.0
	Path      : /credentials/SweeppeaApi.credentials.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * Sweeppea API Credentials
 * Handles authentication and environment configuration for Sweeppea API
 */
export class SweeppeaApi implements ICredentialType {

	name        = 'sweeppeaApi';
	displayName = 'Sweeppea API';
	documentationUrl = 'https://apidocs.sweeppea.com';

	properties: INodeProperties[] = [
		{
			displayName : 'Environment',
			name        : 'environment',
			type        : 'options',
			options     : [
				{
					name  : 'Production',
					value : 'production',
				},
				{
					name  : 'Development',
					value : 'development',
				},
			],
			default     : 'production',
			description : 'The environment to connect to',
		},
		{
			displayName : 'API Token',
			name        : 'apiToken',
			type        : 'string',
			typeOptions : {
				password: true,
			},
			default       : '',
			required      : true,
			description   : 'Your Sweeppea API token (UUID format)',
			placeholder   : 'xxxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
			displayOptions: {
				show: {
					environment: ['production'],
				},
			},
		},
		{
			displayName : 'API Key',
			name        : 'apiKey',
			type        : 'string',
			typeOptions : {
				password: true,
			},
			default       : 'sk_test_mock123456789',
			required      : true,
			description   : 'Your Sweeppea API key for development',
			placeholder   : 'sk_test_mock123456789',
			displayOptions: {
				show: {
					environment: ['development'],
				},
			},
		},
		{
			displayName   : 'Custom API URL',
			name          : 'customApiUrl',
			type          : 'string',
			default       : 'http://localhost:3002',
			required      : true,
			description   : 'Custom API URL for development environment',
			placeholder   : 'http://localhost:3002',
			displayOptions: {
				show: {
					environment: ['development'],
				},
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type   : 'generic',
		properties : {
			headers: {
				Authorization: '={{"Bearer " + ($credentials.environment === "production" ? $credentials.apiToken : $credentials.apiKey)}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL : '={{$credentials.environment === "production" ? "https://api-v3.sweeppea.com" : $credentials.customApiUrl}}',
			url     : '/account/health-check',
			method  : 'POST',
		},
	};
}
