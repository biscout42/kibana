/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { cloneDeep } from 'lodash';
import type {
  TaskManagerSetupContract,
  TaskManagerStartContract,
} from '@kbn/task-manager-plugin/server';
import type {
  LogMeta,
  Logger,
  SavedObjectsClientContract,
  SavedObjectsCreateOptions,
  SavedObjectsFindOptions,
} from '@kbn/core/server';
import type {
  TrialCompanionArtifact,
  TrialCompanionTelemetryService,
  TrialCompanionTelemetryServiceSetup,
  TrialCompanionTelemetryServiceStart,
} from './trial_companion_telemetry_service.types';
import { newTelemetryLogger } from '../../telemetry/helpers';
import { telemetrySavedObjectType } from '../saved_objects';
import { artifactService } from '../../telemetry/artifact';

const TASK_TYPE = 'security:telemetry-trial-companion';
const TASK_ID = `${TASK_TYPE}:1.0.0`;
const INTERVAL = '1h';
const TIMEOUT = '10m';

export class TrialCompanionTelemetryServiceImpl implements TrialCompanionTelemetryService {
  private readonly logger: Logger;

  private _soClient?: SavedObjectsClientContract;

  constructor(logger: Logger) {
    const mdc = { task_id: TASK_ID, task_type: TASK_TYPE };
    this.logger = newTelemetryLogger(logger.get('trial-companion-telemetry-service'), mdc);
  }

  public setup(setup: TrialCompanionTelemetryServiceSetup) {
    this.logger.debug('Setting up health diagnostic service');

    this.registerTask(setup.taskManager);
  }

  public async start(start: TrialCompanionTelemetryServiceStart) {
    this.logger.debug('Starting health diagnostic service');

    this._soClient =
      start.core.savedObjects.createInternalRepository() as unknown as SavedObjectsClientContract;
    await this.scheduleTask(start.taskManager);
  }

  public async updateTelemetryArtifact(artifact: TrialCompanionArtifact) {
    this.logger.info('Updating trial companion telemetry artifact', { artifact } as LogMeta);
    const client = this.savedObjectsClient();

    const opts: SavedObjectsCreateOptions = {};

    const result = await client.create(telemetrySavedObjectType, artifact, opts);

    this.logger.info('Trial companion telemetry artifact updated', {
      result: result.attributes,
    } as LogMeta);
  }

  public async listTelemetryArtifacs() {
    this.logger.info('Listing trial companion telemetry artifacts');

    const client = this.savedObjectsClient();
    const opts: SavedObjectsFindOptions = {
      type: telemetrySavedObjectType,
    };

    const result = await client.find<TrialCompanionArtifact>(opts);

    return result.saved_objects.map((so) => so.attributes);
  }

  private savedObjectsClient(): SavedObjectsClientContract {
    if (this._soClient === undefined || this._soClient === null) {
      throw Error('saved objects client is unavailable');
    }
    return this._soClient;
  }

  private async refreshTrialCompanionTelemetryArtifact(lastExecutionTimestamp: number) {
    this.logger.debug('Running trial companion telemetry artifact refresh', {
      lastExecutionTimestamp,
    } as LogMeta);

    try {
      const artifactName = 'yeti-artifact-v1';
      const manifest = await artifactService.getArtifact(artifactName);

      if (manifest.notModified) {
        this.logger.debug('No new configuration artifact found, skipping...');
        return 0;
      }

      const trialCompanionArtifact = manifest.data as unknown as TrialCompanionArtifact;

      await this.updateTelemetryArtifact(trialCompanionArtifact);

      this.logger.debug('Got trial companion artifact', {
        artifact: trialCompanionArtifact ?? '<null>',
      } as LogMeta);

      this.logger.debug('Updated TrialCompanion Saved Object');
      return 0;
    } catch (error) {
      this.logger.warn('Failed to download trial companion artifact', {
        error,
        error_message: error.message,
      } as LogMeta);
      return 0;
    }
  }

  private registerTask(taskManager: TaskManagerSetupContract) {
    this.logger.debug('About to register task');

    taskManager.registerTaskDefinitions({
      [TASK_TYPE]: {
        title: 'Security Solution Telemetry Trial Companion',
        description: 'Security Solution Telemetry Trial Companion',
        timeout: TIMEOUT,
        maxAttempts: 1,
        stateSchemaByVersion: {
          1: {
            up: (state: Record<string, unknown>) => ({
              lastExecutionTimestamp: state.lastExecutionTimestamp || undefined,
            }),
            schema: schema.object({
              lastExecutionTimestamp: schema.maybe(schema.number()),
            }),
          },
        },
        createTaskRunner: ({ taskInstance }) => {
          return {
            run: async () => {
              const { state } = taskInstance;

              await this.refreshTrialCompanionTelemetryArtifact(
                cloneDeep(state.lastExecutionTimestamp)
              );

              return {
                state: {
                  lastExecutionTimestamp: new Date().getTime(),
                },
              };
            },

            cancel: async () => {
              this.logger?.warn('Task timed out');
            },
          };
        },
      },
    });
  }

  private async scheduleTask(taskManager: TaskManagerStartContract): Promise<void> {
    this.logger.info('About to schedule task');

    await taskManager.ensureScheduled({
      id: TASK_ID,
      taskType: TASK_TYPE,
      schedule: { interval: INTERVAL },
      params: {},
      state: { lastExecutionTimestamp: 0 },
      scope: ['securitySolution'],
    });

    this.logger.info('Task scheduled');
  }
}
