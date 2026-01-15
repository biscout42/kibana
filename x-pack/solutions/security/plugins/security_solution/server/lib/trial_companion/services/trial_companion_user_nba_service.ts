/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/core/server';
import type { SavedObjectsClientContract } from '@kbn/core-saved-objects-api-server';
import { TrialCompanionMilestoneRepositoryImpl } from './trial_companion_milestone_repository';
import type { Milestone } from '../../../../common/trial_companion/types';
import type { TrialCompanionUserNBAService } from './trial_companion_user_nba_service.types';
import type { TrialCompanionMilestoneRepository } from './trial_companion_milestone_repository.types';

export class TrialCompanionUserNBAServiceImpl implements TrialCompanionUserNBAService {
  private readonly repo: TrialCompanionMilestoneRepository;

  constructor(logger: Logger, soClient: SavedObjectsClientContract) {
    this.repo = new TrialCompanionMilestoneRepositoryImpl(logger, soClient);
  }

  async openTODOs(): Promise<Milestone[]> {
    const result = await this.repo.getCurrent();
    if (!result) return [];
    return result.milestoneIds;
  }
}
