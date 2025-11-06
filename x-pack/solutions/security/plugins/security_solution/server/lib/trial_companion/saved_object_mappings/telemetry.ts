/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SECURITY_SOLUTION_SAVED_OBJECT_INDEX } from '@kbn/core-saved-objects-server';
import type { SavedObjectsType } from '@kbn/core/server';

export const telemetrySavedObjectType = 'trial-companion-telemetry';
export const telemetrySavedObjectMappings: SavedObjectsType['mappings'] = {
  properties: {
    cluster: {
      type: 'keyword',
    },
  },
};

export const telemetryType: SavedObjectsType = {
  name: telemetrySavedObjectType,
  indexPattern: SECURITY_SOLUTION_SAVED_OBJECT_INDEX,
  hidden: false,
  namespaceType: 'multiple-isolated',
  convertToMultiNamespaceTypeVersion: '8.0.0',
  mappings: telemetrySavedObjectMappings,
};
