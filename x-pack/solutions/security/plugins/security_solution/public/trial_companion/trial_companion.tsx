/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import useInterval from 'react-use/lib/useInterval';

import React, { useState } from 'react';
import { difference } from 'lodash';
import { YourTrialCompanion } from './nba_steps';
import { useKibana } from '../common/lib/kibana';
import { useGetNBA } from './hooks/use_get_nba';
import { NBA_TODO_LIST } from './nba_translations';
import { useIsExperimentalFeatureEnabled } from '../common/hooks/use_experimental_features';
import type { Milestone } from '../../common/trial_companion/types';

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

const defaultTimeout = 10000;

const TrialCompanionImpl: React.FC<Props> = () => {
  const [count, setCount] = useState(0);
  const [previouslyLoaded, setPreviouslyLoaded] = useState<Milestone[] | undefined>(undefined);
  const { value, loading } = useGetNBA([count]);

  const openTODOs = value?.openTODOs; // no milestoneId means anything to show

  useInterval(() => {
    setCount((c) => c + 1);
  }, defaultTimeout);

  const onDismissButton = () => {};

  let result = previouslyLoaded;
  if (!loading && openTODOs) {
    result = openTODOs;
    if (
      !previouslyLoaded ||
      difference(result, previouslyLoaded).length > 0 ||
      difference(previouslyLoaded, result).length > 0
    ) {
      setPreviouslyLoaded(result);
    }
  }

  if (!result) return null;

  return (
    <YourTrialCompanion open={result} todoItems={NBA_TODO_LIST} onDismissButton={onDismissButton} />
  );
};
