/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/core/server';

export const TASK_TYPE = 'TrialMilestoneDetection:TrialMilestoneDetectionTask';
export const TASK_ID = 'trial-milestone-detection:trial-milestone-detection-task:1.0.0';
export const INTERVAL = '1m'; // testing purposes

export class TrialMilestoneDetectionTask {
  constructor(private readonly logger: Logger) {}

  async detectMilestone() {
    this.logger.info(`TrialMilestoneDetectionTask: Detecting milestone`);
  }
}
