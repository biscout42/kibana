/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { SavedObjectsClientContract, Logger } from '@kbn/core/server';
import type {
  MilestoneID,
  TrialCompanionUserNotification,
  TrialCompanionUserNotificationService,
  TrialCompanionMilestoneRegistryService,
} from '../types';

export class TrialCompanionUserNotificationServiceImpl
  implements TrialCompanionUserNotificationService
{
  private readonly logger: Logger;
  private readonly registry: TrialCompanionMilestoneRegistryService;
  private readonly scopedSoClient: SavedObjectsClientContract;
  constructor(
    logger: Logger,
    registry: TrialCompanionMilestoneRegistryService,
    scopedSoClient: SavedObjectsClientContract
  ) {
    this.logger = logger;
    this.registry = registry;
    this.scopedSoClient = scopedSoClient;
  }

  async currentMilestone(userId: string): Promise<TrialCompanionUserNotification> {
    this.logger.info(
      `TODO: implement method TrialCompanionUserNotificationService.currentMilestone`
    );
    return { milestone: undefined, shouldShow: false };
  }

  async notificationSeen(milestoneId: MilestoneID, userId: string) {
    this.logger.info(
      `TODO: implement method TrialCompanionUserNotificationService.notificationSeen`
    );
  }
}
