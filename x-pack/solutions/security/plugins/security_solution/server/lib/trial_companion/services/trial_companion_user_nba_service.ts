/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/logging';
import type { SavedObjectsClientContract } from '@kbn/core-saved-objects-api-server';
import { TrialCompanionMilestoneRepositoryImpl } from './trial_companion_milestone_repository';
import type { MilestoneID } from '../../../../common/trial_companion/types';
import type { TrialCompanionUserNBAService } from './trial_companion_user_nba_service.types';
import type { TrialCompanionMilestoneRepository } from './trial_companion_milestone_repository.types';
import { Milestones } from '../../../../common/trial_companion/types';

export class TrialCompanionUserNBAServiceImpl implements TrialCompanionUserNBAService {
  private readonly logger: Logger;
  private readonly soClient: SavedObjectsClientContract;
  private readonly repo: TrialCompanionMilestoneRepository;

  constructor(logger: Logger, soClient: SavedObjectsClientContract) {
    this.logger = logger;
    this.soClient = soClient;
    this.repo = new TrialCompanionMilestoneRepositoryImpl(logger, soClient);
  }

  // TODO: implement
  public async markAsSeen(milestoneId: MilestoneID, userId: string): void {
    this.logger.info(`markAsSeen called for user ${userId} and milestone ${milestoneId}`);
  }

  // TODO: implement
  public async nextNBA(userId: string): Promise<MilestoneID | undefined> {
    this.logger.info(`nextNBA called for user ${userId}`);
    return Promise.resolve(Milestones.M1);
  }
}
