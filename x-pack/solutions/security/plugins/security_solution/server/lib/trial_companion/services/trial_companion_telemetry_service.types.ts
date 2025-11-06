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

export interface TrialCompanionTelemetryServiceSetup {
  taskManager: TaskManagerSetupContract;
}

export interface TrialCompanionTelemetryServiceStart {
  taskManager: TaskManagerStartContract;
  core: CoreStart;
}

export interface TrialCompanionTelemetryService {
  setup(setup: TrialCompanionTelemetryServiceSetup): void;
  start(start: TrialCompanionTelemetryServiceStart): Promise<void>;
  updateTelemetryArtifact: (artifact: TrialCompanionArtifact) => Promise<void>;
  listTelemetryArtifacs: () => Promise<TrialCompanionArtifact[]>;
}

export interface TrialCompanionArtifact {
  cluster: string;
}
