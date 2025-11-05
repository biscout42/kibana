/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger } from '@kbn/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';
import { GET_TRIAL_COMPANION_MESSAGE } from '../../../../common/trial_companion/constants';
import type { SecuritySolutionPluginRouter } from '../../../types';
import type { EndpointInternalFleetServicesInterface } from '../../../endpoint/services/fleet';
import { buildSiemResponse } from '../../detection_engine/routes/utils';

/**
 * Milestone 3 of the current milestones dashboard: non-default packages installed
 * We can move this to a separate service/recurring task later
 */
async function checkMilestone3(
  fleet: EndpointInternalFleetServicesInterface,
  logger: Logger
): Promise<string[]> {
  try {
    logger.debug('getCurrentMilestone: Fetching Fleet packages');
    const packages = await fleet.packages.getPackages();
    const installedPackages = packages.filter((pkg) => pkg.status === 'installed');
    const installedPackageNames = installedPackages.map((pkg) => pkg.name);
    // filter out defaults security_ai_prompts, security_detection_engine, elastic_agent, fleet_server
    const defaultPackages = [
      'security_ai_prompts',
      'security_detection_engine',
      'elastic_agent',
      'fleet_server',
    ];
    const nonDefaultPackages = installedPackageNames.filter(
      (pkg) => !defaultPackages.includes(pkg)
    );
    logger.debug(
      `checkMilestone3: Fetched Fleet packages: ${packages.length} items, non-default packages: ${nonDefaultPackages.length}`
    );
    return nonDefaultPackages;
  } catch (error) {
    logger.error('checkMilestone3: Error fetching Fleet packages', error);
    throw error;
  }
}

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
      const siemResponse = buildSiemResponse(response);

      try {
        logger.info('Get Trial Companion Notification route called');

        const ctx = await context.resolve(['core', 'securitySolution']);
        const fleet = ctx.securitySolution.getInternalFleetServices();

        const packages = await checkMilestone3(fleet, logger);

        return response.ok({
          body: {
            message: `Milestone 3 PoC: Non-default packages installed: ${packages.join(', ')}`,
            shouldShow: true,
          },
        });
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
