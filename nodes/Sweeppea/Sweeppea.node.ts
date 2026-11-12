/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/Sweeppea/Sweeppea.node.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IExecuteFunctions,
	INodeExecutionData,
	INodePropertyOptions,
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

import {
	sweepstakeFields,
	sweepstakeOperations,
} from './descriptions/SweepstakeDescription';

import {
	winnerFields,
	winnerOperations,
} from './descriptions/WinnerDescription';

import {
	ruleFields,
	ruleOperations,
} from './descriptions/RuleDescription';

import {
	catalogFields,
	catalogOperationSelectors,
	catalogResourceOptions,
	withCatalogOperations,
} from './descriptions/CatalogDescription';

import { findCatalogOperation } from './catalog';
import { executeCatalogOperation } from './operations/catalog';
import * as loadOptions from './methods/loadOptions';

import * as participantOps from './operations/participant';
import * as sweepstakeOps from './operations/sweepstake';
import * as winnerOps from './operations/winner';
import * as ruleOps from './operations/rule';

/* v0.2 Resources Plus Every Resource Added By The Catalog, Sorted By Name */
const resourceOptions: INodePropertyOptions[] = [
	{ name: 'Participant', value: 'participant' },
	{ name: 'Rule', value: 'rule' },
	{ name: 'Sweepstake', value: 'sweepstake' },
	{ name: 'Winner', value: 'winner' },
	...catalogResourceOptions,
].sort((_a, _b) => _a.name.localeCompare(_b.name, 'en', { sensitivity: 'base' }));

export class Sweeppea implements INodeType {

	description: INodeTypeDescription = {
		displayName : 'Sweeppea',
		name        : 'sweeppea',
		icon        : { light: 'file:sweeppea.svg', dark: 'file:sweeppea.dark.svg' },
		group       : ['transform'],
		version     : 1,
		subtitle    : '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description : 'Run sweepstakes end to end with the Sweeppea API: participants, winners, codes, messaging, surveys, rules and more',
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
		properties: [
			{
				displayName      : 'Resource',
				name             : 'resource',
				type             : 'options',
				noDataExpression : true,
				options          : resourceOptions,
				default: 'participant',
			},
			...withCatalogOperations(participantOperations, 'participant'),
			...withCatalogOperations(ruleOperations, 'rule'),
			...withCatalogOperations(sweepstakeOperations, 'sweepstake'),
			...withCatalogOperations(winnerOperations, 'winner'),
			...catalogOperationSelectors,
			...participantFields,
			...ruleFields,
			...sweepstakeFields,
			...winnerFields,
			...catalogFields,
		],
		usableAsTool: true,
	};

	methods = {
		loadOptions: {
			getGroups        : loadOptions.getGroups,
			getGroupsWithAll : loadOptions.getGroupsWithAll,
			getSweepstakes   : loadOptions.getSweepstakes,
			getTimezones     : loadOptions.getTimezones,
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		const items      = this.getInputData();
		const returnData : INodeExecutionData[] = [];
		const resource   = this.getNodeParameter('resource', 0) as string;
		const operation  = this.getNodeParameter('operation', 0) as string;

		/* v0.3 Operations Are Described In The Catalog; v0.2 Ones Keep Their Hand-written Code */
		const catalogOperation = findCatalogOperation(resource, operation);

		for (let i = 0; i < items.length; i++) {

			try {

				let result: INodeExecutionData[];

				if (catalogOperation) {

					result = await executeCatalogOperation.call(this, catalogOperation, i);

				} else if (resource === 'participant') {

					if (operation === 'count') {

						result = await participantOps.count.call(this, i);

					} else if (operation === 'create') {

						result = await participantOps.create.call(this, i);

					} else if (operation === 'delete') {

						result = await participantOps.remove.call(this, i);

					} else if (operation === 'get') {

						result = await participantOps.get.call(this, i);

					} else if (operation === 'getFormFields') {

						result = await participantOps.getFormFields.call(this, i);

					} else if (operation === 'getMany') {

						result = await participantOps.getMany.call(this, i);

					} else {

						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation "${operation}" for resource "${resource}"`,
							{ itemIndex: i },
						);
					}

				} else if (resource === 'sweepstake') {

					if (operation === 'clone') {

						result = await sweepstakeOps.clone.call(this, i);

					} else if (operation === 'create') {

						result = await sweepstakeOps.create.call(this, i);

					} else if (operation === 'getMany') {

						result = await sweepstakeOps.getMany.call(this, i);

					} else if (operation === 'pause') {

						result = await sweepstakeOps.pause.call(this, i);

					} else if (operation === 'unpause') {

						result = await sweepstakeOps.unpause.call(this, i);

					} else if (operation === 'update') {

						result = await sweepstakeOps.update.call(this, i);

					} else {

						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation "${operation}" for resource "${resource}"`,
							{ itemIndex: i },
						);
					}

				} else if (resource === 'winner') {

					if (operation === 'draw') {

						result = await winnerOps.draw.call(this, i);

					} else if (operation === 'getMany') {

						result = await winnerOps.getMany.call(this, i);

					} else {

						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation "${operation}" for resource "${resource}"`,
							{ itemIndex: i },
						);
					}

				} else if (resource === 'rule') {

					if (operation === 'create') {

						result = await ruleOps.create.call(this, i);

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

				returnData.push(...result);

			} catch (error) {

				if (this.continueOnFail()) {

					returnData.push(buildErrorReturnData(error as JsonObject, i));

					continue;
				}

				/* mapApiError() Maps Raw API Errors To NodeOperation/ApiError */
				/* And Passes Through Already-typed Errors Unchanged           */
				throw mapApiError(this.getNode(), error, i, catalogOperation?.notFound);
			}
		}

		return [returnData];
	}
}
