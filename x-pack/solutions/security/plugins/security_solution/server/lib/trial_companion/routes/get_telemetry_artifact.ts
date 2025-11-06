/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger, IRouter } from '@kbn/core/server';
import { z } from '@kbn/zod';
import { isNonEmptyString } from '@kbn/zod-helpers';
import { GET_TELEMETRY_ARTIFACT as GET_TELEMETRY_ARTIFACTS } from '../../../../common/trial_companion/constants';
import type { TrialCompanionService } from '../services/trial_companion_service.types';

export type NonEmptyString = z.infer<typeof NonEmptyString>;
export const NonEmptyString = z.string().min(1).superRefine(isNonEmptyString);

export type PostLaunchTaskRequestQuery = z.infer<typeof PostLaunchTaskRequestQuery>;
export const PostLaunchTaskRequestQuery = z.object({
  name: NonEmptyString,
});

export const registerGetTelemetryArtifactRoute = (
  router: IRouter,
  logger: Logger,
  trialCompanionService?: TrialCompanionService
) => {
  const log = logger.get('telemetry-artifact');

  router.get(
    {
      path: GET_TELEMETRY_ARTIFACTS,
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
      validate: false,
    },
    async (_, _request, response) => {
      log.info('Running get telemetry artifact task');

      const result = await trialCompanionService?.listTelemetryArtifacs();
      return response.ok({
        body: {
          artifacts: result,
        },
      });
    }
  );
};
