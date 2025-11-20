/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import type { MilestoneID, NBA } from './types';

export const TRIAL_COMPANION_NBA_URL = '/internal/security_solution/trial_companion/nba';
export const TRIAL_COMPANION_NBA_ACTION_URL =
  '/internal/security_solution/trial_companion/nba/action';

/**
 * Milestone step numbers and their corresponding messages
 * These map to the milestone numbers in the Security Portal dashboard
 */
export const ALL_NBA_COMPLETE_MESSAGE = i18n.translate(
  'xpack.securitySolution.trialCompanion.allNBAComplete.message',
  {
    defaultMessage: 'Congratulations! You’ve completed all the steps to get started with Security.',
  }
);

export const ALL_NBA_COMPLETE_TITLE = i18n.translate(
  'xpack.securitySolution.trialCompanion.allNBAComplete,title',
  {
    defaultMessage: 'You’re all set!',
  }
);

export const ALL_NBA: Record<MilestoneID, NBA> = {
  M7: {
    message: ALL_NBA_COMPLETE_MESSAGE,
    title: ALL_NBA_COMPLETE_TITLE,
  },
};
