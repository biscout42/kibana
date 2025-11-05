/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger } from '@kbn/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';
import type { UsageCollectionSetup } from '@kbn/usage-collection-plugin/server';
import { GET_TRIAL_COMPANION_MESSAGE } from '../../../../common/trial_companion/constants';
import type { SecuritySolutionPluginRouter } from '../../../types';
import { buildSiemResponse } from '../../detection_engine/routes/utils';
import { TrialMilestoneDetectionTask } from '../services/trial_milestone_detection_task';

export const registerGetNotificationRoute = (
  router: SecuritySolutionPluginRouter,
  logger: Logger,
  usageCollection?: UsageCollectionSetup
) => {
  router.get(
    {
      path: GET_TRIAL_COMPANION_MESSAGE,
      options: {
        access: 'internal',
      },
      validate: false,
      security: {
        authz: {
          requiredPrivileges: ['securitySolution'],
        },
      },
    },
    async (context, _request, response) => {
      const siemResponse = buildSiemResponse(response);

      try {
        logger.info('Get Trial Companion Notification route called');

        const ctx = await context.resolve(['core', 'securitySolution']);
        const fleet = ctx.securitySolution.getInternalFleetServices();

        // Build CollectorFetchContext for usage collectors
        const collectorContext = {
          esClient: ctx.core.elasticsearch.client.asInternalUser,
          soClient: ctx.core.savedObjects.client,
        };

        // Create task instance with dependencies and use its detectMilestone method
        const task = new TrialMilestoneDetectionTask({
          logger,
          fleet,
          collectorContext,
          usageCollection,
        });

        const message = await task.detectMilestone();

        if (message) {
          return response.ok({
            body: {
              message,
              shouldShow: true,
            },
          });
        } else {
          return response.ok({
            body: {
              shouldShow: false,
            },
          });
        }
      } catch (err) {
        logger.error('Get Trial Companion Notification route: Caught error:', err);
        const error = transformError(err);
        return siemResponse.error({
          body: error.message,
          statusCode: error.statusCode,
        });
      }
    }
  );
};
