/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';
import { buildSiemResponse } from '@kbn/lists-plugin/server/routes';
import { TRIAL_COMPANION_NBA_URL } from '../../../../common/trial_companion/constants';
import { Milestones } from '../../../../common/trial_companion/types';
import type { SecuritySolutionPluginRouter } from '../../../types';

export const registerGetNBARoute = (router: SecuritySolutionPluginRouter, logger: Logger) => {
  router.versioned
    .get({
      path: TRIAL_COMPANION_NBA_URL,
      access: 'internal',
      options: {
        access: 'internal',
        tag: ['api'],
        summary: 'Get Trial Companion NBA for a user',
      },
      security: {
        authz: {
          requiredPrivileges: ['securitySolution'],
        },
      },
    })
    .addVersion(
      {
        version: '1',
        validate: false, // TODO: help needed here - do we need to validate something?
      },
      getCurrentNBAForUser(logger)
    );
};

export const registerPostNBASeenRoute = (router: SecuritySolutionPluginRouter, logger: Logger) => {
  router.versioned
    .post({
      path: TRIAL_COMPANION_NBA_URL,
      access: 'internal',
      options: {
        access: 'internal',
        tag: ['api'],
        summary: 'Save Trial Companion NBA seen action (aka dismiss)',
      },
      security: {
        authz: {
          requiredPrivileges: ['securitySolution'],
        },
      },
    })
    .addVersion(
      {
        version: '1',
        validate: {
          body: schema.object({
            milestoneId: schema.number(),
          }),
        },
      },
      postNBAUserSeen(logger)
    );
};

export const registerPostNBAActionRoute = (
  router: SecuritySolutionPluginRouter,
  logger: Logger
) => {
  // TODO: TBD - use TRIAL_COMPANION_NBA_ACTION_URL
};

const postNBAUserSeen = (
  logger: Logger
): ((context, request, response) => Promise<IKibanaResponse>) => {
  const siemResponse = buildSiemResponse(response);
  const { milestoneId } = request.body;
  try {
    logger.info(`POST Trial Companion NBA seen route called. milestoneId: ${milestoneId}`);
    const core = await context.core;

    const currentUser = await core.userProfile.getCurrent();
    const user = currentUser?.user;
    logger.info(`User data. Username: ${user?.username}, uid: ${currentUser?.uid}`);

    if (!user) {
      return response.notFound({
        body: 'User not found',
      });
    }

    return response.ok({});
  } catch (err) {
    logger.error(`Post Trial Companion NBA seen route: Caught error: ${err}`);
    const error = transformError(err);
    return siemResponse.error({
      body: error.message,
      statusCode: error.statusCode,
    });
  }
};

const getCurrentNBAForUser = (
  logger: Logger
): ((context, request, response) => Promise<IKibanaResponse>) => {
  const siemResponse = buildSiemResponse(response);
  try {
    logger.info('Get Trial Companion NBA route called');
    const core = await context.core;

    const currentUser = await core.userProfile.getCurrent();
    const user = currentUser?.user;
    logger.info(`User data. Username: ${user?.username}, uid: ${currentUser?.uid}`);

    if (!user) {
      return response.notFound({
        body: 'User not found',
      });
    }
    return response.ok({
      // TODO: should I use @kbn/zod and more types to common/api/trial_companion? Why?
      body: {
        milestoneId: Milestones.M7,
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
};
