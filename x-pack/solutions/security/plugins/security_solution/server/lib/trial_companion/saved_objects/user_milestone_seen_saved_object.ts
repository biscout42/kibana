/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { SavedObjectsType } from '@kbn/core/server';
import { SECURITY_SOLUTION_SAVED_OBJECT_INDEX } from '@kbn/core-saved-objects-server';

export interface UserMilestoneSeenSavedObjectAttributes {
  userId: string;
  milestoneIds: number[];
}

export const USER_MILESTONE_SEEN_SAVED_OBJECT_TYPE = 'trial-companion-user-milestone-seen';

const savedObjectMappings: SavedObjectsType['mappings'] = {
  properties: {
    userId: {
      type: 'text',
    },
    milestoneIds: {
      type: 'integer',
    },
  },
};

export const userMilestoneSeenSavedObject: SavedObjectsType = {
  name: USER_MILESTONE_SEEN_SAVED_OBJECT_TYPE,
  indexPattern: SECURITY_SOLUTION_SAVED_OBJECT_INDEX,
  hidden: false,
  namespaceType: 'multiple-isolated',
  mappings: savedObjectMappings,
};
