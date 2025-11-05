/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { LogMeta, Logger } from '@kbn/core/server';
import type { ITelemetryEventsSender } from '../sender';
import { type TrialCompanionArtifact } from '../types';
import type { ITelemetryReceiver } from '../receiver';
import type { TaskExecutionPeriod } from '../task';
import type { ITaskMetricsService } from '../task_metrics.types';
import { artifactService } from '../artifact';
import { telemetryConfiguration } from '../configuration';
import { newTelemetryLogger } from '../helpers';

export function createTelemetryTrialCompanionTaskConfig() {
  const taskName = 'Security Solution Telemetry Trial Companion';
  const taskType = 'security:telemetry-trial-companion';
  return {
    type: taskType,
    title: taskName,
    interval: '1m',
    timeout: '1m',
    version: '1.0.0',
    runTask: async (
      taskId: string,
      logger: Logger,
      _receiver: ITelemetryReceiver,
      _sender: ITelemetryEventsSender,
      _taskMetricsService: ITaskMetricsService,
      taskExecutionPeriod: TaskExecutionPeriod
    ) => {
      const mdc = { task_id: taskId, task_execution_period: taskExecutionPeriod };
      const log = newTelemetryLogger(logger.get('trial-companion'), mdc);

      log.debug('Running telemetry task');

      try {
        const artifactName = 'yeti-artifact-v1';
        const manifest = await artifactService.getArtifact(artifactName);

        if (manifest.notModified) {
          log.debug('No new configuration artifact found, skipping...');
          return 0;
        }

        const trialCompanionArtifact = manifest.data as unknown as TrialCompanionArtifact;

        log.debug('Got trial companion artifact', {
          artifact: trialCompanionArtifact ?? '<null>',
        } as LogMeta);

        log.debug('Updated TrialCompanion Saved Object');
        return 0;
      } catch (error) {
        log.warn('Failed to download trial companion artifact', {
          error,
          error_message: error.message,
        } as LogMeta);
        telemetryConfiguration.resetAllToDefault();
        return 0;
      }
    },
  };
}
