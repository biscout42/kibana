/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import useInterval from 'react-use/lib/useInterval';

import React, { useState } from 'react';
import { YourTrialCompanion } from './nba_steps';
import { useKibana } from '../common/lib/kibana';
import { useGetNBA } from './hooks/use_get_nba';
import { NBA_TODO_LIST } from './nba_translations';
import { useIsExperimentalFeatureEnabled } from '../common/hooks/use_experimental_features';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

export const TrialCompanion: React.FC<Props> = () => {
  const { ...startServices } = useKibana().services;
  const trialCompanionEnabled = useIsExperimentalFeatureEnabled('trialCompanionEnabled');
  if (!startServices.cloud?.isInTrial() || !trialCompanionEnabled) {
    return null;
  }

  return <TrialCompanionImpl />;
};

const defaultTimeout = 30000;

const TrialCompanionImpl: React.FC<Props> = () => {
  const [count, setCount] = useState(0);
  const { value, loading } = useGetNBA([count]);

  const milestoneId = value?.milestoneId; // no milestoneId means anything to show

  useInterval(() => {
    setCount((c) => c + 1);
  }, defaultTimeout);

  if (loading || !milestoneId) return null;

  return <YourTrialCompanion completed={[milestoneId]} todoItems={NBA_TODO_LIST} />;
};
