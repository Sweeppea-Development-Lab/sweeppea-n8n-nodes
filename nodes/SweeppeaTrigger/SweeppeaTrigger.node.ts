/*
	 ___
	/ __|_ __ _____ ___ _ __ _ __  ___ __ _
	\__ \ V  V / -_) -_) '_ \ '_ \/ -_) _` |
	|___/\_/\_/\___\___| .__/ .__/\___\__,_|
	                    |_|  |_|

	Platform  : Sweeppea N8N Integration
	Version   : 0.3.0
	Path      : /nodes/SweeppeaTrigger/SweeppeaTrigger.node.ts

	(c) Sweeppea, all rights reserved.
*/

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

import { sweeppeaApiRequest } from '../Sweeppea/GenericFunctions';
import { extractList } from '../Sweeppea/operations/catalog';
import { getSweepstakes } from '../Sweeppea/methods/loadOptions';

/* How Many IDs Are Remembered Between Polls (Per Trigger Node) */
const SEEN_LIMIT = 1000;

/* Pages Read Per Poll While Every Item Is New (Burst Protection) */
const MAX_PAGES_PER_POLL = 10;

interface EventDefinition {
	endpoint   : string;
	pageKey    : string;
	sizeKey?   : string;
	pageSize   : number;
	idKeys     : string[];
	listKey    : string;
	body       : (_poll: IPollFunctions) => IDataObject;
}

const EVENTS: Record<string, EventDefinition> = {
	newParticipant: {
		endpoint : '/participants/fetch',
		pageKey  : 'page',
		pageSize : 20,
		idKeys   : ['ParticipantToken', 'Token', '_id'],
		listKey  : 'Participants',
		body     : _poll => ({ sweepstakesToken: _poll.getNodeParameter('sweepstakesToken') as string }),
	},
	newWinner: {
		endpoint : '/winners/fetch',
		pageKey  : 'page',
		sizeKey  : 'itemsPerPage',
		pageSize : 100,
		idKeys   : ['WinnerToken', 'Token', '_id', 'ParticipantToken'],
		listKey  : 'Winners',
		body     : _poll => ({ sweepstakesToken: _poll.getNodeParameter('sweepstakesToken') as string }),
	},
	newSurveyResponse: {
		endpoint : '/surveys/responses',
		pageKey  : 'Page',
		sizeKey  : 'Limit',
		pageSize : 100,
		idKeys   : ['ResponseToken', 'Token', '_id'],
		listKey  : 'Responses',
		body     : _poll => ({ SurveyToken: _poll.getNodeParameter('surveyToken') as string }),
	},
};

/* Stable ID For An Item: The First Known Token Key, Else Its JSON */
function itemId(_item: IDataObject, _idKeys: string[]): string {

	for (const key of _idKeys) {

		if (_item[key] !== undefined && _item[key] !== null && _item[key] !== '') {

			return String(_item[key]);
		}
	}

	return JSON.stringify(_item);
}

export class SweeppeaTrigger implements INodeType {

	description: INodeTypeDescription = {
		displayName : 'Sweeppea Trigger',
		name        : 'sweeppeaTrigger',
		icon        : { light: 'file:sweeppea.svg', dark: 'file:sweeppea.dark.svg' },
		group       : ['trigger'],
		version     : 1,
		subtitle    : '={{$parameter["event"]}}',
		description : 'Starts the workflow when a sweepstake gets a new participant, a new winner or a new survey response',
		defaults    : {
			name: 'Sweeppea Trigger',
		},
		polling     : true,
		inputs      : [],
		outputs     : [NodeConnectionTypes.Main],
		credentials : [
			{
				name     : 'sweeppeaApi',
				required : true,
			},
		],
		properties: [
			{
				displayName : 'Event',
				name        : 'event',
				type        : 'options',
				options     : [
					{
						name        : 'New Participant',
						value       : 'newParticipant',
						description : 'Someone entered the sweepstake',
					},
					{
						name        : 'New Survey Response',
						value       : 'newSurveyResponse',
						description : 'A survey received a new response',
					},
					{
						name        : 'New Winner',
						value       : 'newWinner',
						description : 'A winner was drawn',
					},
				],
				default     : 'newParticipant',
				required    : true,
			},
			{
				displayName    : 'Sweepstake Name or ID',
				name           : 'sweepstakesToken',
				type           : 'options',
				typeOptions    : {
					loadOptionsMethod: 'getSweepstakes',
				},
				displayOptions : {
					show: {
						event: ['newParticipant', 'newWinner'],
					},
				},
				default     : '',
				required    : true,
				description : 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName    : 'Survey Token',
				name           : 'surveyToken',
				type           : 'string',
				typeOptions    : {
					password: true,
				},
				displayOptions : {
					show: {
						event: ['newSurveyResponse'],
					},
				},
				default     : '',
				required    : true,
				placeholder : '83d12d10-7a6d-4f99-a546-5a1c3cc267f9',
				description : 'Token of the survey to watch (from Sweeppea → Survey → Get Many)',
			},
		],
	};

	methods = {
		loadOptions: {
			getSweepstakes,
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {

		const event      = this.getNodeParameter('event') as string;
		const definition = EVENTS[event];

		if (!definition) {

			throw new NodeOperationError(this.getNode(), `Unknown event "${event}"`);
		}

		const staticData = this.getWorkflowStaticData('node') as IDataObject;
		const seen       = new Set<string>((staticData.seen as string[] | undefined) ?? []);
		const isFirstRun = staticData.seen === undefined;
		const isManual   = this.getMode() === 'manual';
		const baseBody   = definition.body(this);
		const fresh      : IDataObject[] = [];

		for (let page = 1; page <= MAX_PAGES_PER_POLL; page++) {

			const body: IDataObject = { ...baseBody, [definition.pageKey]: page };

			if (definition.sizeKey) {

				body[definition.sizeKey] = definition.pageSize;
			}

			const response = await sweeppeaApiRequest.call(this, 'POST', definition.endpoint, body);
			const rows     = extractList(response, definition.listKey) ?? [];

			/* Manual "Fetch Test Event": Show The Most Recent Item, Touch No State */
			if (isManual) {

				return rows.length > 0 ? [[{ json: rows[0] }]] : null;
			}

			const newRows = rows.filter(_row => !seen.has(itemId(_row, definition.idKeys)));

			fresh.push(...newRows);

			/* Stop As Soon As A Page Contains Something Already Seen, Or Is The Last One */
			if (isFirstRun || newRows.length < rows.length || rows.length < definition.pageSize) {

				break;
			}
		}

		for (const row of fresh) {

			seen.add(itemId(row, definition.idKeys));
		}

		staticData.seen = Array.from(seen).slice(-SEEN_LIMIT);

		/* First Activation Only Records The Baseline: Old Entries Are Not Replayed */
		if (isFirstRun || fresh.length === 0) {

			return null;
		}

		/* The API Lists Newest First; Emit Oldest First So Downstream Order Is Chronological */
		return [fresh.reverse().map(_row => ({ json: _row }))];
	}
}
