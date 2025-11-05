/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger } from '@kbn/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';
import type {
  CollectorFetchContext,
  UsageCollectionSetup,
} from '@kbn/usage-collection-plugin/server';
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

async function checkMilestone6(
  collectorContext: CollectorFetchContext,
  logger: Logger,
  usageCollection?: UsageCollectionSetup
): Promise<number> {
  try {
    if (!usageCollection) {
      logger.warn('checkMilestone6: usageCollection is not available');
      return 0;
    }

    logger.info('checkMilestone6: Fetching rules telemetry from usage collector');
    const securitySolutionCollector = usageCollection.getCollectorByType('security_solution');

    if (!securitySolutionCollector) {
      logger.warn('checkMilestone6: security_solution collector not found');
      return 0;
    }

    // Fetch the telemetry data from the collector with proper context
    const securitySolutionResult = await securitySolutionCollector.fetch(collectorContext);

    logger.info(
      `checkMilestone6: Security solution telemetry result keys: ${Object.keys(
        securitySolutionResult || {}
      ).join(', ')}`
    );

    // Extract enabled rules count from detection_rules usage
    interface SecuritySolutionTelemetry {
      detectionMetrics?: {
        detection_rules?: {
          detection_rule_usage?: {
            custom_total?: { enabled?: number };
            elastic_total?: { enabled?: number };
          };
        };
      };
    }
    const detectionMetrics = (securitySolutionResult as SecuritySolutionTelemetry)
      ?.detectionMetrics;
    const detectionRules = detectionMetrics?.detection_rules;
    const ruleUsage = detectionRules?.detection_rule_usage;

    const customEnabled = ruleUsage?.custom_total?.enabled ?? 0;
    const elasticEnabled = ruleUsage?.elastic_total?.enabled ?? 0;
    const rulesCount = customEnabled + elasticEnabled;

    logger.debug(
      `checkMilestone6: Rules count - custom: ${customEnabled}, elastic: ${elasticEnabled}, total: ${rulesCount}`
    );
    return rulesCount;
  } catch (error) {
    logger.error(`checkMilestone6: Error fetching security solution telemetry: ${error}`);
    return 0;
  }
}

/**
 * Milestone 7: Total alerts count
 * Retrieves cached telemetry data from the alerts usage collector
 * This is the same metric as stack_stats.kibana.plugins.alerts.count_alerts_total
 */
async function checkMilestone7(
  collectorContext: CollectorFetchContext,
  logger: Logger,
  usageCollection?: UsageCollectionSetup
): Promise<number> {
  try {
    if (!usageCollection) {
      logger.warn('checkMilestone7: usageCollection is not available');
      return 0;
    }

    logger.debug('checkMilestone7: Fetching alerts telemetry from usage collector');
    const alertsCollector = usageCollection.getCollectorByType('alerts');

    if (!alertsCollector) {
      logger.warn('checkMilestone7: alerts collector not found');
      return 0;
    }

    // Fetch the telemetry data from the collector with proper context
    const alertsCountResult = await alertsCollector.fetch(collectorContext);

    logger.debug(
      `checkMilestone7: Alerts telemetry result keys: ${Object.keys(alertsCountResult || {}).join(
        ', '
      )}`
    );

    // Extract count_alerts_total from the result
    const totalAlertsCount =
      (alertsCountResult as { count_alerts_total?: number })?.count_alerts_total ?? 0;

    logger.debug(`checkMilestone7: Total alerts count: ${totalAlertsCount}`);
    return totalAlertsCount;
  } catch (error) {
    logger.error('checkMilestone7: Error fetching alerts telemetry', error);
    return 0;
  }
}

/**
 * Detects which milestone the user hasn't reached and returns an appropriate message
 * Returns undefined if all milestones are complete
 */
async function detectMilestone(
  fleet: EndpointInternalFleetServicesInterface,
  collectorContext: CollectorFetchContext,
  logger: Logger,
  usageCollection?: UsageCollectionSetup
): Promise<string | undefined> {
  // Check Milestone 3: non-default packages installed
  const packages = await checkMilestone3(fleet, logger);
  logger.info(`checkMilestone3: Packages: ${packages.join(', ')}`);
  if (packages.length === 0) {
    return 'You never reached milestone 3: Do you need help installing new integrations?';
  }

  // Check Milestone 6: enabled security rules
  const rulesCount = await checkMilestone6(collectorContext, logger, usageCollection);
  logger.info(`checkMilestone6: Rules count: ${rulesCount}`);
  if (rulesCount === 0) {
    return 'You never reached milestone 6: Would you like to enable security rules?';
  }

  // Check Milestone 7: alerts created
  const alertsCount = await checkMilestone7(collectorContext, logger, usageCollection);
  logger.info(`checkMilestone7: Alerts count: ${alertsCount}`);
  if (alertsCount === 0) {
    return 'You never reached milestone 7: Do you need help creating test alerts?';
  }

  // All milestones complete
  return undefined;
}

export const registerGetNotificationRoute = (
  router: SecuritySolutionPluginRouter,
  logger: Logger,
  usageCollection?: UsageCollectionSetup
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

        const core = await context.core;
        const securitySolution = await context.securitySolution;
        const fleet = securitySolution.getInternalFleetServices();

        // Build CollectorFetchContext for usage collectors
        const collectorContext: CollectorFetchContext = {
          esClient: core.elasticsearch.client.asInternalUser,
          soClient: core.savedObjects.client,
        };

        const message = await detectMilestone(fleet, collectorContext, logger, usageCollection);

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
