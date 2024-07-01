/**
 * TUS implementation for resumable uploads
 *
 * https://tus.io/
 */
import { useEnv } from '@directus/env';
import type { TusDriver } from '@directus/storage';
import { toArray } from '@directus/utils';
import { Server } from '@tus/server';
import type { Request } from 'express';
import { cloneDeep } from 'lodash-es';
import { getStorage } from '../../storage/index.js';
import { TusDataStore } from './data-store.js';
import { getTusLocker } from './lockers.js';
import type { IncomingMessage } from 'node:http';
import { RESUMABLE_UPLOADS } from '../../constants.js';
import { FilesService, ItemsService } from '../index.js';

let _store: TusDataStore | undefined = undefined;

async function getTusStore() {
	if (!_store) {
		const env = useEnv();
		const storage = await getStorage();
		const location = toArray(env['STORAGE_LOCATIONS'] as string)[0]!;
		const driver = storage.location(location) as TusDriver;

		_store = new TusDataStore({
			constants: RESUMABLE_UPLOADS,
			location,
			driver,
		});
	}

	return _store;
}

let _server: Server | undefined = undefined;

export async function getTusServer() {
	if (!_server) {
		const env = useEnv();
		const store = await getTusStore();

		_server = new Server({
			path: '/files/tus',
			datastore: store,
			locker: getTusLocker(),
			maxSize: RESUMABLE_UPLOADS.MAX_SIZE,
			async onIncomingRequest(msg: IncomingMessage) {
				const req = msg as Request;
				// Make sure that the schema modification does not influence anything else
				const schema = cloneDeep(req.schema);

				store.itemsService = new ItemsService('directus_files', {
					accountability: req.accountability,
					schema: schema,
				});

				store.sudoItemService = new ItemsService('directus_files', {
					schema,
				});
			},
			async onUploadFinish(req: any, res, upload) {
				const service = new FilesService({
					schema: req.schema,
				});

				await service.updateByQuery(
					{
						filter: { tus_id: { _eq: upload.id } },
					},
					{
						tus_id: null,
						tus_data: null,
					},
				);

				return res;
			},
			generateUrl(_req, opts) {
				return env['PUBLIC_URL'] + '/files/tus/' + opts.id;
			},
			relativeLocation: String(env['PUBLIC_URL']).startsWith('http'),
		});
	}

	return _server;
}