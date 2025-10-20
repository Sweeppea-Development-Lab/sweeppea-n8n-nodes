/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 1.0
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
	documentationUrl = 'https://docs.sweeppea.com';

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
					name  : 'Staging',
					value : 'staging',
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
			displayName : 'API Key',
			name        : 'apiKey',
			type        : 'string',
			typeOptions : {
				password: true,
			},
			default     : '',
			required    : true,
			description : 'Your Sweeppea API key (starts with sk_)',
			placeholder : 'sk_live_...',
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
		type       : 'generic',
		properties : {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL : '={{$credentials.environment === "production" ? "https://api.sweeppea.com" : $credentials.environment === "staging" ? "https://staging-api.sweeppea.com" : $credentials.customApiUrl}}',
			url     : '/health',
			method  : 'GET',
		},
	};
}
