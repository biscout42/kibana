/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { SavedObjectsServiceStart } from '@kbn/core-saved-objects-server';

export type MilestoneID = number;

export interface TrialCompanionUserNotificationService {
  notificationSeen(milestoneId: MilestoneID, userId: string);
  currentMilestone(userId: string): Promise<TrialCompanionUserNotification>;
}

export interface TrialCompanionMilestone {
  id: MilestoneID;
  message: string;
  savedObjectId: string;
}

export interface TrialCompanionUserNotification {
  milestone?: TrialCompanionMilestone;
  shouldShow: boolean;
}

export interface TrialCompanionMilestoneService {
  getCurrent(): Promise<TrialCompanionMilestone | undefined>;
  save(milestone: TrialCompanionMilestone): Promise<void>;
  start(savedObjects: SavedObjectsServiceStart);
}
