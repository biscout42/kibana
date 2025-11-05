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

export const registerTrialCompanionRoutes = (
  router: SecuritySolutionPluginRouter,
  logger: Logger,
  usageCollection?: UsageCollectionSetup,
  receiver?: ITelemetryReceiver
) => {
  registerGetNotificationRoute(router, logger, usageCollection);
  registerLaunchTaskRoute(router, logger, receiver);
};
