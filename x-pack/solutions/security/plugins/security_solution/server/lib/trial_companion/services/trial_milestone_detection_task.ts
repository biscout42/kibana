/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CoreStart, Logger, StartServicesAccessor } from '@kbn/core/server';
import type {
  CollectorFetchContext,
  UsageCollectionSetup,
} from '@kbn/usage-collection-plugin/server';
import type { EndpointAppContextService } from '../../../endpoint/endpoint_app_context_services';
import type { SecuritySolutionPluginStartDependencies } from '../../../plugin_contract';

export const TASK_TYPE = 'TrialMilestoneDetection:TrialMilestoneDetectionTask';
export const TASK_ID = 'trial-milestone-detection:trial-milestone-detection-task:1.0.0';
export const INTERVAL = '1m'; // testing purposes

/**
 * Milestone step numbers and their corresponding messages
 * These map to the milestone numbers in the Security Portal dashboard
 */
export const MILESTONE_STEPS = {
  ALL_MILESTONES_COMPLETE: {
    step: -1,
    message: 'All milestones complete',
  },
  INSTALL_INTEGRATIONS: {
    step: 3,
    message: 'Do you need help installing new integrations?',
  },
  ENABLE_SECURITY_RULES: {
    step: 6,
    message: 'Would you like to enable security rules?',
  },
  CREATE_ALERTS: {
    step: 7,
    message: 'Do you need help creating test alerts?',
  },
} as const;

export interface TrialMilestoneDetectionTaskDeps {
  logger: Logger;
  endpointAppContextService: EndpointAppContextService;
  usageCollection?: UsageCollectionSetup;
  core: StartServicesAccessor<SecuritySolutionPluginStartDependencies>;
}

export class TrialMilestoneDetectionTask {
  private readonly logger: Logger;
  private readonly core: Promise<CoreStart>;
  private readonly endpointAppContextService: EndpointAppContextService;
  private readonly usageCollection?: UsageCollectionSetup;

  constructor(deps: TrialMilestoneDetectionTaskDeps) {
    this.logger = deps.logger;
    this.endpointAppContextService = deps.endpointAppContextService;
    this.core = deps.core().then(([core]) => core);
    this.usageCollection = deps.usageCollection;
  }

  /**
   * Milestone 3 of the current milestones dashboard: non-default packages installed
   */
  private async verifyNonDefaultPackagesInstalled(): Promise<string[]> {
    try {
      this.logger.debug('verifyNonDefaultPackagesInstalled: Fetching Fleet packages');

      const fleet = this.endpointAppContextService.getInternalFleetServices(); // need to read here as task is set up in setup() phase where fleet is not available
      if (!fleet) {
        // TODO: What do we do in this case? Probably skip this milestone and continue with the next one?
        // According to the startup code fleet may be nil
        this.logger.warn('verifyNonDefaultPackagesInstalled: fleet is not available');
        return [];
      }
      const packages = await fleet.packages.getPackages();
      const installedPackages = packages.filter((pkg) => pkg.status === 'installed');
      const installedPackageNames = installedPackages.map((pkg) => pkg.name);
      // filter out defaults security_ai_prompts, security_detection_engine, elastic_agent, fleet_server
      const defaultPackages = [
        'endpoint', // installed by default on serverless even if not visible in the UI (see Slack thread), TODO: should be handled differently for ECH
        'security_ai_prompts',
        'security_detection_engine',
        'elastic_agent',
        'fleet_server',
      ];
      const nonDefaultPackages = installedPackageNames.filter(
        (pkg) => !defaultPackages.includes(pkg)
      );
      this.logger.info(
        `verifyNonDefaultPackagesInstalled: Fetched Fleet packages: ${
          packages.length
        } items, non-default packages: ${
          nonDefaultPackages.length
        }, installed package names: ${nonDefaultPackages.join(', ')}`
      );
      return nonDefaultPackages;
    } catch (error) {
      this.logger.error('verifyNonDefaultPackagesInstalled: Error fetching Fleet packages', error);
      throw error;
    }
  }

  /**
   * Milestone 6: Enabled security rules count
   */
  private async verifyEnabledSecurityRulesCount(
    collectorContext: CollectorFetchContext
  ): Promise<number> {
    try {
      if (!this.usageCollection) {
        this.logger.warn('verifyEnabledSecurityRulesCount: usageCollection is not available');
        return 0;
      }

      this.logger.info(
        'verifyEnabledSecurityRulesCount: Fetching rules telemetry from usage collector'
      );
      const securitySolutionCollector =
        this.usageCollection.getCollectorByType('security_solution');

      if (!securitySolutionCollector) {
        this.logger.warn('verifyEnabledSecurityRulesCount: security_solution collector not found');
        return 0;
      }

      // Fetch the telemetry data from the collector with proper context
      const securitySolutionResult = await securitySolutionCollector.fetch(collectorContext);

      this.logger.info(
        `verifyEnabledSecurityRulesCount: Security solution telemetry result keys: ${Object.keys(
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

      this.logger.debug(
        `verifyEnabledSecurityRulesCount: Rules count - custom: ${customEnabled}, elastic: ${elasticEnabled}, total: ${rulesCount}`
      );
      return rulesCount;
    } catch (error) {
      this.logger.error(
        `verifyEnabledSecurityRulesCount: Error fetching security solution telemetry: ${error}`
      );
      return 0;
    }
  }

  /**
   * Milestone 7: Total alerts count
   * Retrieves cached telemetry data from the alerts usage collector
   * This is the same metric as stack_stats.kibana.plugins.alerts.count_alerts_total
   */
  private async verifyTotalAlertsCount(collectorContext: CollectorFetchContext): Promise<number> {
    try {
      if (!this.usageCollection) {
        this.logger.warn('verifyTotalAlertsCount: usageCollection is not available');
        return 0;
      }

      this.logger.debug('verifyTotalAlertsCount: Fetching alerts telemetry from usage collector');
      const alertsCollector = this.usageCollection.getCollectorByType('alerts');

      if (!alertsCollector) {
        this.logger.warn('verifyTotalAlertsCount: alerts collector not found');
        return 0;
      }

      // Fetch the telemetry data from the collector with proper context
      const alertsCountResult = await alertsCollector.fetch(collectorContext);

      this.logger.debug(
        `verifyTotalAlertsCount: Alerts telemetry result keys: ${Object.keys(
          alertsCountResult || {}
        ).join(', ')}`
      );

      // Extract count_alerts_total from the result
      const totalAlertsCount =
        (alertsCountResult as { count_alerts_total?: number })?.count_alerts_total ?? 0;

      this.logger.debug(`verifyTotalAlertsCount: Total alerts count: ${totalAlertsCount}`);
      return totalAlertsCount;
    } catch (error) {
      this.logger.error('verifyTotalAlertsCount: Error fetching alerts telemetry', error);
      return 0;
    }
  }

  /**
   * Detects which milestone the user hasn't reached and returns a tuple of [step number, message]
   * Returns [-1, 'All milestones complete'] if all milestones are complete
   */
  async detectMilestone(): Promise<[number, string]> {
    const packages = await this.verifyNonDefaultPackagesInstalled();
    this.logger.info('Running milestone detection task');
    if (packages.length === 0) {
      this.logger.info(`Advising user to take step ${MILESTONE_STEPS.INSTALL_INTEGRATIONS.step}`);
      return [
        MILESTONE_STEPS.INSTALL_INTEGRATIONS.step,
        MILESTONE_STEPS.INSTALL_INTEGRATIONS.message,
      ];
    }

    const core = await this.core;
    const collectorContext = {
      esClient: core.elasticsearch.client.asInternalUser,
      soClient: core.savedObjects.createInternalRepository(),
    };

    const rulesCount = await this.verifyEnabledSecurityRulesCount(collectorContext);
    if (rulesCount === 0) {
      this.logger.info(`Advising user to take step ${MILESTONE_STEPS.ENABLE_SECURITY_RULES.step}`);
      return [
        MILESTONE_STEPS.ENABLE_SECURITY_RULES.step,
        MILESTONE_STEPS.ENABLE_SECURITY_RULES.message,
      ];
    }

    const alertsCount = await this.verifyTotalAlertsCount(collectorContext);
    if (alertsCount === 0) {
      this.logger.info(`Advising user to take step ${MILESTONE_STEPS.CREATE_ALERTS.step}`);
      return [MILESTONE_STEPS.CREATE_ALERTS.step, MILESTONE_STEPS.CREATE_ALERTS.message];
    }

    // All milestones complete
    this.logger.info('All milestones complete');
    return [
      MILESTONE_STEPS.ALL_MILESTONES_COMPLETE.step,
      MILESTONE_STEPS.ALL_MILESTONES_COMPLETE.message,
    ];
  }
}
