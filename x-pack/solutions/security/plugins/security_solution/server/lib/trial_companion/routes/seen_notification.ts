/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import type { Logger } from '@kbn/core/server';
import { buildSiemResponse } from '@kbn/lists-plugin/server/routes';
import { transformError } from '@kbn/securitysolution-es-utils';
import type { SecuritySolutionPluginRouter } from '../../../types';
import type {
  TrialCompanionMilestoneRegistryService,
  TrialCompanionUserNotificationService,
} from '../types';
import { GET_TRIAL_COMPANION_MESSAGE } from '../../../../common/trial_companion/constants';
import { TrialCompanionUserNotificationServiceImpl } from '../services/trial_companion_user_notification_service';

export const registerSeenNotificationRoute = (
  router: SecuritySolutionPluginRouter,
  logger: Logger,
  trialCompanionMilestoneRegistryService: TrialCompanionMilestoneRegistryService
) => {
  router.post(
    {
      path: GET_TRIAL_COMPANION_MESSAGE,
      options: {
        access: 'internal',
      },
      validate: {
        body: schema.object({
          milestoneId: schema.number(),
        }),
      },
      security: {
        authz: {
          requiredPrivileges: ['securitySolution'],
        },
      },
    },
    async (context, request, response) => {
      const siemResponse = buildSiemResponse(response);
      const { milestoneId } = request.body;
      try {
        logger.info('Post Trial Companion Notification route called');

        const core = await context.core;
        const soClient = core.savedObjects.client;
        const service: TrialCompanionUserNotificationService =
          new TrialCompanionUserNotificationServiceImpl(
            logger,
            trialCompanionMilestoneRegistryService,
            soClient
          );

        const currentUser = await core.userProfile.getCurrent();
        const user = currentUser?.user;
        logger.info(`User data. Username: ${user?.username}, uid: ${currentUser?.uid}`);

        if (!user) {
          return response.notFound({
            body: 'User not found',
          });
        }
        await service.notificationSeen(milestoneId, user.username);
        return response.ok({});
      } catch (err) {
        logger.error(`Post Trial Companion Notification route: Caught error: ${err}`);
        const error = transformError(err);
        return siemResponse.error({
          body: error.message,
          statusCode: error.statusCode,
        });
      }
    }
  );
};
