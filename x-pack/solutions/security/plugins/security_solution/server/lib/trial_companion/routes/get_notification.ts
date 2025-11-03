/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger } from '@kbn/core/server';
import { GET_TRIAL_COMPANION_MESSAGE } from '../../../../common/trial_companion/constants';
import type { SecuritySolutionPluginRouter } from '../../../types';

export const registerGetNotificationRoute = (
  router: SecuritySolutionPluginRouter,
  logger: Logger
) => {
  router.get(
    {
      path: GET_TRIAL_COMPANION_MESSAGE,
      access: 'internal',
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
    async (context, request, response) => {
      logger.info('Get Trial Companion Notification route called');
      return response.ok({
        body: {
          message: 'This is a trial companion notification',
        },
      });
    }
  );
};
