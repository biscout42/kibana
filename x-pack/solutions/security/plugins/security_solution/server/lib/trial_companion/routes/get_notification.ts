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
import type { TrialMilestoneDetectionTaskDeps } from '../services/trial_milestone_detection_task';
import { TrialMilestoneDetectionTask } from '../services/trial_milestone_detection_task';
import type { EndpointAppContextService } from '../../../endpoint/endpoint_app_context_services';

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

        // deps.core is not a function
        const core = await context.core;
        const currentUser = await core.userProfile.getCurrent();

        logger.info(`User data. Username: ${currentUser?.user.username}, uid: ${currentUser?.uid}`);

        const securitySolution = await context.securitySolution;
        const fleet: EndpointAppContextService = securitySolution.getInternalFleetServices();
        const soClient = core.savedObjects.client;

        // soClient.get()

        const collectorContext = {
          esClient: core.elasticsearch.client.asInternalUser,
          soClient: core.savedObjects.client,
        };

        // Create task instance with dependencies and use its detectMilestone method
        const task = new TrialMilestoneDetectionTask({
          logger,
          fleet,
          usageCollection,
          core: collectorContext,
        } as TrialMilestoneDetectionTaskDeps);

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
        logger.error(`Get Trial Companion Notification route: Caught error: ${err}`);
        const error = transformError(err);
        return siemResponse.error({
          body: error.message,
          statusCode: error.statusCode,
        });
      }
    }
  );
};
