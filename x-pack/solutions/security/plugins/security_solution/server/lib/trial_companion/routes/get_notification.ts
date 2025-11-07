/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger } from '@kbn/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';
import { buildSiemResponse } from '@kbn/lists-plugin/server/routes';
import { GET_TRIAL_COMPANION_MESSAGE } from '../../../../common/trial_companion/constants';
import type { SecuritySolutionPluginRouter } from '../../../types';
import type { TrialCompanionUserNotificationService } from '../types';

export const registerGetNotificationRoute = (
  router: SecuritySolutionPluginRouter,
  logger: Logger,
  trialCompanionUserNotificationService: TrialCompanionUserNotificationService
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

        // TODO: dry with post
        const core = await context.core;

        const currentUser = await core.userProfile.getCurrent();
        const user = currentUser?.user;
        logger.info(`User data. Username: ${user?.username}, uid: ${currentUser?.uid}`);

        if (!user) {
          return response.notFound({
            body: 'User not found',
          });
        }

        const milestone = await trialCompanionUserNotificationService.currentMilestone(
          user.username
        );

        return response.ok({
          body: {
            message: milestone.milestone?.message,
            shouldShow: milestone.shouldShow,
            milestoneId: milestone.milestone?.id,
            title: milestone.milestone?.title,
            app: milestone.milestone?.app,
          },
        });
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
