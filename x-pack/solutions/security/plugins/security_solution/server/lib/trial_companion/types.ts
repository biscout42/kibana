/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/core/server';
import type { SecuritySolutionPluginRouter } from '../../types';
import type { Milestone } from '../../../common/trial_companion/types';

export interface TrialCompanionRoutesDeps {
  router: SecuritySolutionPluginRouter;
  logger: Logger;
  enabled: boolean;
}

// TODO: make an array, based on new UX design
export interface NBAMilestone {
  milestoneId: Milestone;
  savedObjectId: string;
}

// represent a get started milestone (NBA) to be done
export type DetectorF = () => Promise<Milestone | undefined>;

export type GetStartedTasks = (detectors: DetectorF[]) => Milestone[];
