/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { KibanaServices } from '../common/lib/kibana';
import { GET_TRIAL_COMPANION_MESSAGE } from '../../common/trial_companion/constants';

export interface GetNotificationResponse {
  message: string;
  shouldShow: boolean;
  title: string;
  app?: string;
  milestoneId: number;
}

export const getNotification = async (): Promise<GetNotificationResponse> => {
  return KibanaServices.get().http.get<GetNotificationResponse>(GET_TRIAL_COMPANION_MESSAGE);
};

export const postMilestoneNotificationSeen = async (milestoneId: number): Promise<void> => {
  return KibanaServices.get().http.post<void>(GET_TRIAL_COMPANION_MESSAGE, {
    body: JSON.stringify({
      milestoneId,
    }),
  });
};
