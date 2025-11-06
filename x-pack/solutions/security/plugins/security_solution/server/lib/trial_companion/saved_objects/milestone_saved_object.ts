/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { SavedObjectsType } from '@kbn/core/server';
import { SECURITY_SOLUTION_SAVED_OBJECT_INDEX } from '@kbn/core-saved-objects-server';
import type { MilestoneID } from '../types';

export interface MilestoneSavedObjectAttributes {
  milestoneId: MilestoneID;
  message: string;
  title: string;
  app: string;
}

export const MILESTONE_SAVED_OBJECT_TYPE = 'trial-companion-milestone';

const savedObjectMappings: SavedObjectsType['mappings'] = {
  properties: {
    milestoneId: {
      type: 'integer',
    },
    message: {
      type: 'text',
    },
    title: {
      type: 'text',
    },
    app: {
      type: 'text',
    },
  },
};

export const trialCompanionMilestoneSeenSavedObject: SavedObjectsType = {
  name: MILESTONE_SAVED_OBJECT_TYPE,
  indexPattern: SECURITY_SOLUTION_SAVED_OBJECT_INDEX,
  hidden: false,
  namespaceType: 'multiple-isolated',
  mappings: savedObjectMappings,
};
