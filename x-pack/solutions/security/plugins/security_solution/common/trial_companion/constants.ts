/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';

export const GET_TRIAL_COMPANION_MESSAGE =
  '/internal/security_solution/trial_companion/notification';

export const POST_LAUNCH_TASK = '/internal/security_solution/launch-task';

export const GET_TELEMETRY_ARTIFACT = '/internal/security_solution/telemetry-artifacts';

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
