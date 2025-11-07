/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Logger } from '@kbn/core/server';
import type { UsageCollectionSetup } from '@kbn/usage-collection-plugin/server';
import type { SecuritySolutionPluginRouter } from '../../types';
import { registerGetNotificationRoute } from './routes/get_notification';
import { registerLaunchTaskRoute } from './routes/launch_task';
import type { ITelemetryReceiver } from '../telemetry/receiver';
import { registerGetTelemetryArtifactRoute } from './routes/get_telemetry_artifact';
import type { TrialCompanionTelemetryService } from './services/trial_companion_telemetry_service.types';
import type { TrialCompanionUserNotificationService } from './types';
import { registerSeenNotificationRoute } from './routes/seen_notification';

export const registerTrialCompanionRoutes = (
  router: SecuritySolutionPluginRouter,
  logger: Logger,
  trialCompanionUserNotificationService: TrialCompanionUserNotificationService,
  usageCollection?: UsageCollectionSetup,
  receiver?: ITelemetryReceiver,
  trialCompanionTelemetryService?: TrialCompanionTelemetryService
) => {
  registerGetNotificationRoute(router, logger, trialCompanionUserNotificationService);
  registerSeenNotificationRoute(router, logger, trialCompanionUserNotificationService);
  registerLaunchTaskRoute(router, logger, receiver);
  registerGetTelemetryArtifactRoute(router, logger, trialCompanionTelemetryService);
};
