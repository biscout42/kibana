/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { SavedObjectsClientContract, Logger, SavedObject } from '@kbn/core/server';
import type {
  MilestoneID,
  TrialCompanionUserNotification,
  TrialCompanionUserNotificationService,
  TrialCompanionMilestoneRegistryService,
} from '../types';
import type { UserMilestoneSeenSavedObjectAttributes } from '../saved_objects';
import { USER_MILESTONE_SEEN_SAVED_OBJECT_TYPE } from '../saved_objects';

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
    const milestone = await this.registry.getCurrent();
    const userStatus = await this.getUserMilestoneStatus(userId);
    let shouldShow;
    if (milestone) {
      shouldShow = !userStatus || !userStatus.attributes.milestoneIds.includes(milestone.id);
    } else {
      shouldShow = false;
    }

    return { milestone, shouldShow };
  }

  private async getUserMilestoneStatus(
    userId: string
  ): Promise<SavedObject<UserMilestoneSeenSavedObjectAttributes> | undefined> {
    const userStatusResponse =
      await this.scopedSoClient.find<UserMilestoneSeenSavedObjectAttributes>({
        type: USER_MILESTONE_SEEN_SAVED_OBJECT_TYPE,
        search: userId,
        searchFields: ['userId'],
      });
    return userStatusResponse.saved_objects[0];
  }

  async notificationSeen(milestoneId: MilestoneID, userId: string) {
    const currentSO = await this.getUserMilestoneStatus(userId);
    const current = currentSO?.attributes;

    if (currentSO && current && !current.milestoneIds.includes(milestoneId)) {
      current.milestoneIds.push(milestoneId);
      const response = await this.scopedSoClient.update<UserMilestoneSeenSavedObjectAttributes>(
        USER_MILESTONE_SEEN_SAVED_OBJECT_TYPE,
        currentSO.id,
        current
      );
      this.logger.info(`Updated user milestone seen SO: ${response}`);
    } else {
      const response = await this.scopedSoClient.create<UserMilestoneSeenSavedObjectAttributes>(
        USER_MILESTONE_SEEN_SAVED_OBJECT_TYPE,
        {
          userId,
          milestoneIds: [milestoneId],
        }
      );
      this.logger.info(`Created user milestone seen SO: ${response}`);
    }

    this.logger.info(
      `TODO: implement method TrialCompanionUserNotificationService.notificationSeen`
    );
  }
}
