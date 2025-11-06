/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ElasticsearchClient, Logger, SavedObjectsClientContract } from '@kbn/core/server';
import type {
  TaskManagerSetupContract,
  TaskManagerStartContract,
} from '@kbn/task-manager-plugin/server';
import type {
  CollectorFetchContext,
  UsageCollectionSetup,
} from '@kbn/usage-collection-plugin/server';
import type { PackageService } from '@kbn/fleet-plugin/server';
import { i18n } from '@kbn/i18n';
import type {
  TrialCompanionMilestoneService,
  TrialCompanionMilestoneServiceSetup,
  TrialCompanionMilestoneServiceStart,
} from './trial_companion_milestone_service.types';
import { newTelemetryLogger } from '../../telemetry/helpers';
import type { TrialCompanionMilestoneRegistryService } from '../types';

const TASK_TYPE = 'security:trial-companion-milestone';
const TASK_TITLE = 'This task periodically checks currently achieved milestones.';
const TASK_ID = `${TASK_TYPE}:1.0.0`;
const INTERVAL = '1m'; // testing purposes
const TIMEOUT = '10m';

/**
 * Milestone step numbers and their corresponding messages
 * These map to the milestone numbers in the Security Portal dashboard
 */
export const ALL_MILESTONES_COMPLETE_MESSAGE = i18n.translate(
  'xpack.securitySolution.trialCompanion.allMilestonesCompleteMessage',
  {
    defaultMessage: 'Congratulations! You’ve completed all the steps to get started with Security.',
  }
);

export const ALL_MILESTONES_COMPLETE_TITLE = i18n.translate(
  'xpack.securitySolution.trialCompanion.allMilestonesCompleteTitle',
  {
    defaultMessage: 'You’re all set!',
  }
);

export const INSTALL_INTEGRATIONS_MESSAGE = i18n.translate(
  'xpack.securitySolution.trialCompanion.installIntegrationsMessage',
  {
    defaultMessage:
      'Ready to connect your tools? Add integrations to see all your logs, metrics, and traces in one place.',
  }
);

export const INSTALL_INTEGRATIONS_TITLE = i18n.translate(
  'xpack.securitySolution.trialCompanion.installIntegrationsTitle',
  {
    defaultMessage: 'Add your data sources',
  }
);

export const ENABLE_SECURITY_RULES_MESSAGE = i18n.translate(
  'xpack.securitySolution.trialCompanion.enableSecurityRulesMessage',
  {
    defaultMessage:
      'Ready to enable security rules? You can add our recommendations or create your own.',
  }
);

export const ENABLE_SECURITY_RULES_TITLE = i18n.translate(
  'xpack.securitySolution.trialCompanion.enableSecurityRulesTitle',
  {
    defaultMessage: 'Start detecting threats',
  }
);

export const CREATE_ALERTS_MESSAGE = i18n.translate(
  'xpack.securitySolution.trialCompanion.createAlertsMessage',
  {
    defaultMessage:
      'Generate a sample alert to see how your rules work and what happens when a threat is found.',
  }
);

export const CREATE_ALERTS_TITLE = i18n.translate(
  'xpack.securitySolution.trialCompanion.createAlertsTitle',
  {
    defaultMessage: 'CSee your rules in action',
  }
);

export const MILESTONE_STEPS = {
  ALL_MILESTONES_COMPLETE: {
    step: -1,
    message: ALL_MILESTONES_COMPLETE_MESSAGE,
    title: ALL_MILESTONES_COMPLETE_TITLE,
    app: '',
  },
  INSTALL_INTEGRATIONS: {
    step: 3,
    message: INSTALL_INTEGRATIONS_MESSAGE,
    title: INSTALL_INTEGRATIONS_TITLE,
    app: '/fleet/policies',
  },
  ENABLE_SECURITY_RULES: {
    step: 6,
    message: ENABLE_SECURITY_RULES_MESSAGE,
    title: ENABLE_SECURITY_RULES_TITLE,
    app: '/security/rules/management',
  },
  CREATE_ALERTS: {
    step: 7,
    message: CREATE_ALERTS_MESSAGE,
    title: CREATE_ALERTS_TITLE,
    app: '/security/alerts',
  },
} as const;

export class TrialCompanionMilestoneServiceImpl implements TrialCompanionMilestoneService {
  private readonly logger: Logger;

  private packageService?: PackageService;

  private usageCollection?: UsageCollectionSetup;

  private _soClient?: SavedObjectsClientContract;

  private _esClient?: ElasticsearchClient;

  private trialCompanionMilestoneRegistryService: TrialCompanionMilestoneRegistryService;

  constructor(logger: Logger) {
    const mdc = { task_id: TASK_ID, task_type: TASK_TYPE };
    this.logger = newTelemetryLogger(logger.get('trial-companion-milestone-service'), mdc);
  }

  public setup(setup: TrialCompanionMilestoneServiceSetup) {
    this.logger.debug('Setting up health diagnostic service');
    this.usageCollection = setup.usageCollection;
    this.registerTask(setup.taskManager);
  }

  public async start(start: TrialCompanionMilestoneServiceStart) {
    this.logger.debug('Starting health diagnostic service');

    this._esClient = start.core.elasticsearch.client.asInternalUser;
    this.logger.info(`Starting *** health diagnostic _esClient: ${this._esClient}`);
    this._soClient =
      start.core.savedObjects.createInternalRepository() as unknown as SavedObjectsClientContract;
    this.packageService = start.packageService;
    this.trialCompanionMilestoneRegistryService = start.registry;

    await this.scheduleTask(start.taskManager);
  }

  /**
   * Detects which milestone the user hasn't reached and returns a tuple of [step number, message]
   * Returns [-1, 'All milestones complete'] if all milestones are complete
   */
  async detectMilestone(): Promise<[number, string, string, string]> {
    const packages = await this.verifyNonDefaultPackagesInstalled();
    this.logger.info('Running milestone detection task');
    if (packages.length === 0) {
      this.logger.info(`Advising user to take step ${MILESTONE_STEPS.INSTALL_INTEGRATIONS.step}`);
      return [
        MILESTONE_STEPS.INSTALL_INTEGRATIONS.step,
        MILESTONE_STEPS.INSTALL_INTEGRATIONS.message,
        MILESTONE_STEPS.INSTALL_INTEGRATIONS.title,
        MILESTONE_STEPS.INSTALL_INTEGRATIONS.app,
      ];
    }

    const collectorContext = {
      esClient: this.esClient(),
      soClient: this.savedObjectsClient(),
    };

    const rulesCount = await this.verifyEnabledSecurityRulesCount(collectorContext);
    if (rulesCount === 0) {
      this.logger.info(`Advising user to take step ${MILESTONE_STEPS.ENABLE_SECURITY_RULES.step}`);
      return [
        MILESTONE_STEPS.ENABLE_SECURITY_RULES.step,
        MILESTONE_STEPS.ENABLE_SECURITY_RULES.message,
        MILESTONE_STEPS.ENABLE_SECURITY_RULES.title,
        MILESTONE_STEPS.ENABLE_SECURITY_RULES.app,
      ];
    }

    const alertsCount = await this.verifyTotalAlertsCount(collectorContext);
    if (alertsCount === 0) {
      this.logger.info(`Advising user to take step ${MILESTONE_STEPS.CREATE_ALERTS.step}`);
      return [
        MILESTONE_STEPS.CREATE_ALERTS.step,
        MILESTONE_STEPS.CREATE_ALERTS.message,
        MILESTONE_STEPS.CREATE_ALERTS.title,
        MILESTONE_STEPS.CREATE_ALERTS.app,
      ];
    }

    // All milestones complete
    this.logger.info('All milestones complete');
    return [
      MILESTONE_STEPS.ALL_MILESTONES_COMPLETE.step,
      MILESTONE_STEPS.ALL_MILESTONES_COMPLETE.message,
      MILESTONE_STEPS.ALL_MILESTONES_COMPLETE.title,
      MILESTONE_STEPS.ALL_MILESTONES_COMPLETE.app,
    ];
  }

  /**
   * Milestone 3 of the current milestones dashboard: non-default packages installed
   */
  private async verifyNonDefaultPackagesInstalled(): Promise<string[]> {
    try {
      this.logger.debug('verifyNonDefaultPackagesInstalled: Fetching Fleet packages');

      if (!this.packageService) {
        // TODO: What do we do in this case? Probably skip this milestone and continue with the next one?
        // According to the startup code fleet may be nil
        this.logger.warn('verifyNonDefaultPackagesInstalled: fleet is not available');
        return [];
      }
      const packages = await this.packageService.asInternalUser.getPackages();
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

  private registerTask(taskManager: TaskManagerSetupContract) {
    this.logger.debug('About to register task');

    taskManager.registerTaskDefinitions({
      [TASK_TYPE]: {
        title: TASK_TITLE,
        timeout: TIMEOUT,
        maxAttempts: 1,
        createTaskRunner: () => {
          return {
            // TODO: better place and error handling
            run: async () => {
              const current = await this.detectMilestone();
              this.logger.info(`Current milestone detected: ${current}`);
              const saved = await this.trialCompanionMilestoneRegistryService.getCurrent();
              this.logger.info(`Saved milestone detected: ${saved}`);
              if (!saved) {
                const result = await this.trialCompanionMilestoneRegistryService.create(
                  current[0],
                  current[1],
                  current[2],
                  current[3]
                );
                this.logger.info(`Saved new milestone: ${result}`);
              } else {
                saved.id = current[0];
                saved.message = current[1];
                saved.title = current[2];
                saved.app = current[3];
                // TODO: update only if changed
                const result = await this.trialCompanionMilestoneRegistryService.save(saved);
                this.logger.info(`Updated existing milestone : ${result}`);
              }
            },

            cancel: async () => {
              this.logger?.warn('Task timed out');
            },
          };
        },
      },
    });
  }

  private async scheduleTask(taskManager: TaskManagerStartContract): Promise<void> {
    this.logger.info('About to schedule task');

    await taskManager.ensureScheduled({
      id: TASK_ID,
      taskType: TASK_TYPE,
      schedule: { interval: INTERVAL },
      params: {},
      state: {},
      scope: ['securitySolution'],
    });

    this.logger.info('Task scheduled');
  }

  private savedObjectsClient(): SavedObjectsClientContract {
    if (this._soClient === undefined || this._soClient === null) {
      throw Error('saved objects client is unavailable');
    }
    return this._soClient;
  }

  private esClient(): ElasticsearchClient {
    if (this._esClient === undefined || this._esClient === null) {
      throw Error('elasticsearch client is unavailable');
    }
    return this._esClient;
  }
}
