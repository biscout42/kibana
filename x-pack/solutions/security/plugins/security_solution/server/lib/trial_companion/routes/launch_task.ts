/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger, IRouter, LogMeta } from '@kbn/core/server';
import { z } from '@kbn/zod';
import { isNonEmptyString, buildRouteValidationWithZod } from '@kbn/zod-helpers';
import type { ITelemetryReceiver } from '../../telemetry/receiver';
import { LAUNCH_TASK } from '../../../../common/trial_companion/constants';

export type NonEmptyString = z.infer<typeof NonEmptyString>;
export const NonEmptyString = z.string().min(1).superRefine(isNonEmptyString);

export type PostLaunchTaskRequestQuery = z.infer<typeof PostLaunchTaskRequestQuery>;
export const PostLaunchTaskRequestQuery = z.object({
  name: NonEmptyString,
});

// TODO: not meant to be merged
export const registerLaunchTaskRoute = (
  router: IRouter,
  logger: Logger,
  receiver?: ITelemetryReceiver
) => {
  const log = logger.get('health-diagnostic');

  router.post(
    {
      path: LAUNCH_TASK,
      security: {
        authz: {
          requiredPrivileges: ['securitySolution'],
        },
      },
      options: {
        tags: ['api'],
        access: 'public',
        summary: 'Trigger a telemetry task (for testing purposes)',
      },
      validate: {
        query: buildRouteValidationWithZod(PostLaunchTaskRequestQuery),
      },
    },
    async (_, request, response) => {
      const name = request.query.name;

      log.info('Running diagnostic task', { event: { name } } as LogMeta);

      await receiver?.launchTask(name);

      return response.ok({
        body: {
          task: name,
          message: 'Task launched',
        },
      });
    }
  );
};
