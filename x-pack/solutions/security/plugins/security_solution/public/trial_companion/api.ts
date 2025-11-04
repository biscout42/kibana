/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { KibanaServices } from '../common/lib/kibana';
import { GET_TRIAL_COMPANION_MESSAGE } from '../../common/trial_companion/constants';

interface GetNotificationResponse {
  message: string;
}

export const getNotification = async (): Promise<string> => {
  const response = await KibanaServices.get().http.get<GetNotificationResponse>(
    GET_TRIAL_COMPANION_MESSAGE
  );
  return response.message;
};
