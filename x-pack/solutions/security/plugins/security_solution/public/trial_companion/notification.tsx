/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import useInterval from 'react-use/lib/useInterval';

import React, { useEffect, useRef, useState } from 'react';
import { toMountPoint } from '@kbn/react-kibana-mount';
import { useGetNotification } from './hooks/use_get_notification';
import { postMilestoneNotificationSeen } from './api';
import { useKibana } from '../common/lib/kibana';
import { TrialNotificationMessage } from './notification_message';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

export const TrialNotification: React.FC<Props> = () => {
  const { overlays, ...startServices } = useKibana().services;
  const bannerId = useRef<string | undefined>();
  const [count, setCount] = useState(0);

  const { value, error, loading } = useGetNotification([count]);
  window.console.log('TrialNotification useGetNotification:', error, loading, value);
  const message = value?.message;
  const shouldShow = value?.shouldShow;
  const milestoneId = value?.milestoneId ?? 0;
  const title = value?.title || '';
  const app = value?.app;

  useInterval(() => {
    setCount((c) => c + 1);
  }, 10000);

  useEffect(() => {
    window.console.log('running effect on change:', message, shouldShow);
    const removeBanner = () => {
      window.console.log('remove banner with id:', bannerId.current);
      if (bannerId.current) {
        overlays.banners.remove(bannerId.current);
      }
      bannerId.current = undefined;
    };

    const onSeenBanner = () => {
      postMilestoneNotificationSeen(milestoneId);
      removeBanner();
    };

    const onViewButton = () => {
      postMilestoneNotificationSeen(milestoneId);
      removeBanner();
      if (app) {
        startServices.application.navigateToApp(app);
      }
    };

    if (message && shouldShow && !bannerId.current) {
      const mount = toMountPoint(
        <TrialNotificationMessage
          message={message}
          onSeenBanner={onSeenBanner}
          title={title}
          onViewButton={onViewButton}
        />,
        startServices
      );
      window.console.log('mounted banner with id:', bannerId.current, message, bannerId.current);
      bannerId.current = overlays.banners.replace(bannerId.current, mount, 1000);
    } else if (!shouldShow || !message) {
      removeBanner();
    } // else do nothing, keep the banner shown
  }, [overlays, startServices, message, shouldShow, milestoneId, title, app]);

  useEffect(() => {
    return () => {
      if (bannerId.current) {
        overlays.banners.remove(bannerId.current);
      }
      bannerId.current = undefined;
    };
  }, [overlays]);

  return null;
};
