/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { EventTypeOpts } from '@kbn/core/server';

export const TRIAL_COMPANION_DEPLOYMENT_MILESTONE: EventTypeOpts<{ milestoneId: number }> = {
  eventType: 'trial_companion_deployment_milestone',
  schema: {
    milestoneId: {
      type: 'long',
      _meta: {
        description: 'Trial Companion deployment milestone aka NBA',
      },
    },
  },
};

export const TRIAL_COMPANION_USER_SEEN_MILESTONE: EventTypeOpts<{ milestoneIds: number[] }> = {
  eventType: 'trial_companion_user_seen_milestone',
  schema: {
    milestoneIds: {
      type: 'array',
      items: {
        type: 'long',
        _meta: { description: '' },
      },
      _meta: {
        description: 'Milestone IDs dismissed by user',
      },
    },
  },
};

export const TRIAL_COMPANION_MILESTONE_REFRESH_ERROR: EventTypeOpts<{ message: string }> = {
  eventType: 'trial_companion_milestone_refresh_error',
  schema: {
    message: {
      type: 'keyword',
      _meta: {
        description: 'Error message during milestone refresh',
      },
    },
  },
};

export const TRIAL_COMPANION_EVENTS = [
  TRIAL_COMPANION_DEPLOYMENT_MILESTONE,
  TRIAL_COMPANION_USER_SEEN_MILESTONE,
  TRIAL_COMPANION_MILESTONE_REFRESH_ERROR,
];
