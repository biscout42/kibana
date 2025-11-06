/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CoreStart } from '@kbn/core/server';
import type {
  TaskManagerSetupContract,
  TaskManagerStartContract,
} from '@kbn/task-manager-plugin/server';

export interface TrialCompanionServiceSetup {
  taskManager: TaskManagerSetupContract;
}

export interface TrialCompanionServiceStart {
  taskManager: TaskManagerStartContract;
  core: CoreStart;
}

export interface TrialCompanionService {
  setup(setup: TrialCompanionServiceSetup): void;
  start(start: TrialCompanionServiceStart): Promise<void>;
  updateTelemetryArtifact: (artifact: TrialCompanionArtifact) => Promise<void>;
  listTelemetryArtifacs: () => Promise<TrialCompanionArtifact[]>;
}

export interface TrialCompanionArtifact {
  cluster: string;
}
