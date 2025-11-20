/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import useInterval from 'react-use/lib/useInterval';

import type { MutableRefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { toMountPoint } from '@kbn/react-kibana-mount';
import { NBANotification } from './nba_notification';
import { useKibana } from '../common/lib/kibana';
import { useGetNBA } from './hooks/use_get_nba';
import { postNBAUserSeen } from './api';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

export const TrialCompanion: React.FC<Props> = () => {
  const { overlays, ...startServices } = useKibana().services;
  const bannerId = useRef<string | undefined>();
  const [count, setCount] = useState(0);

  const { value, error, loading } = useGetNBA([count]);
  window.console.log('TrialNotification useGetNotification:', error, loading, value); // TODO: remove
  const milestoneId = value?.milestoneId; // no milestoneId means nothing to show

  useInterval(() => {
    setCount((c) => c + 1);
  }, 30000); // TODO: constant

  useEffect(() => {
    window.console.log('running effect on change:', message, shouldShow);
    const onSeenBanner = () => {
      postNBAUserSeen(milestoneId);
      removeBanner(bannerId)();
    };

    const onViewButton = () => {
      if (app) {
        startServices.application.navigateToApp(app);
      }
    };

    if (milestoneId && !bannerId.current) {
      const mount = toMountPoint(
        <NBANotification
          milestoneId={milestoneId}
          onSeenBanner={onSeenBanner}
          onViewButton={onViewButton}
        />,
        startServices
      );
      window.console.log('mounted banner with id:', bannerId.current, message, bannerId.current);
      bannerId.current = overlays.banners.replace(bannerId.current, mount, 1000);
    } else if (bannerId.current && !milestoneId && !loading) {
      removeBanner();
    } // else do nothing, keep the banner shown
  }, [overlays, startServices, milestoneId, loading]);

  useEffect(() => removeBanner(bannerId), [overlays]);
  return null;
};

const removeBanner = (bannerId: MutableRefObject<string | undefined>): (() => void) => {
  window.console.log('remove banner with id:', bannerId.current);
  if (bannerId.current) {
    overlays.banners.remove(bannerId.current);
  }
  bannerId.current = undefined;
};
