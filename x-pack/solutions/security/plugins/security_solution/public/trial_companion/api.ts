/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { MilestoneID } from '../../common/trial_companion/types';
import { TRIAL_COMPANION_NBA_URL } from '../../common/trial_companion/constants';

export interface GetNBAResponse {
  milestoneId?: MilestoneID;
}

export const getNBA = async (): Promise<GetNBAResponse> => {
  return KibanaServices.get().http.get<GetNBAResponse>(TRIAL_COMPANION_NBA_URL);
};

export const postNBAUserSeen = async (milestoneId: MilestoneID): Promise<void> => {
  return KibanaServices.get().http.post<void>(TRIAL_COMPANION_NBA_URL, {
    body: JSON.stringify({
      milestoneId,
    }),
  });
};
