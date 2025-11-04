/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ExperimentalFeatures } from '../../../../common';
import type { SecurityTelemetryTaskConfig } from '../task';
import { createIngestStatsTaskConfig } from './ingest_pipelines_stats';
import { createTelemetryConfigurationTaskConfig } from './configuration';
import { createTelemetryCustomResponseActionRulesTaskConfig } from './custom_response_actions_rule';
import { createTelemetryDetectionRuleListsTaskConfig } from './detection_rule';
import { createTelemetryDiagnosticsTaskConfig } from './diagnostic';
import { createTelemetryDiagnosticTimelineTaskConfig } from './timelines_diagnostic';
import { createTelemetryEndpointTaskConfig } from './endpoint';
import { createTelemetryFilterListArtifactTaskConfig } from './filterlists';
import { createTelemetryIndicesMetadataTaskConfig } from './indices.metadata';
import { createTelemetryPrebuiltRuleAlertsTaskConfig } from './prebuilt_rule_alerts';
import { createTelemetrySecurityListTaskConfig } from './security_lists';
import { createTelemetryTimelineTaskConfig } from './timelines';
import { createTelemetryTrialCompanionTaskConfig } from './trial_companion';
import { telemetryConfiguration } from '../configuration';

export function createTelemetryTaskConfigs(
  _experimentalFeatures: ExperimentalFeatures
): SecurityTelemetryTaskConfig[] {
  const tasks = [
    createTelemetryDiagnosticsTaskConfig(),
    createTelemetryTrialCompanionTaskConfig(),
    createTelemetryEndpointTaskConfig(telemetryConfiguration.max_security_list_telemetry_batch),
    createTelemetrySecurityListTaskConfig(telemetryConfiguration.max_endpoint_telemetry_batch),
    createTelemetryDetectionRuleListsTaskConfig(
      telemetryConfiguration.max_detection_rule_telemetry_batch
    ),
    createTelemetryPrebuiltRuleAlertsTaskConfig(telemetryConfiguration.max_detection_alerts_batch),
    createTelemetryTimelineTaskConfig(),
    createTelemetryDiagnosticTimelineTaskConfig(),
    createTelemetryConfigurationTaskConfig(),
    createTelemetryFilterListArtifactTaskConfig(),
    createTelemetryIndicesMetadataTaskConfig(),
    createIngestStatsTaskConfig(),
    createTelemetryCustomResponseActionRulesTaskConfig(
      telemetryConfiguration.max_detection_rule_telemetry_batch
    ),
  ];

  return tasks;
}
