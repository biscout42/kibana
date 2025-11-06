/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import useInterval from 'react-use/lib/useInterval';

import React, { useEffect, useRef, useState } from 'react';
import { toMountPoint } from '@kbn/react-kibana-mount';
import { useGetNotification, postMilestoneNotificationSeen } from './hooks/use_get_notification';
import { useKibana } from '../common/lib/kibana';
import { TrialNotificationMessage } from './notification_message';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

export const TrialNotification: React.FC<Props> = () => {
  const { overlays, ...startServices } = useKibana().services;

  // TODO: why to use memo for services, see https://github.com/elastic/kibana/commit/6f89bd542bf80e68d128ed6ce09db4ed15855511#diff-2425eabbda427442eccf29ed61395290a09b082ac4cbce092ccdb2cf4ed72946R26-R35
  // TODO: lazy load component

  const bannerId = useRef<string | undefined>();
  const [count, setCount] = useState(0);

  const { value, error, loading } = useGetNotification([count]);
  window.console.log('TrialNotification useGetNotification:', error, loading);
  const message = value?.message;
  const shouldShow = value?.shouldShow;
  const milestoneId = value?.milestoneId;

  useInterval(() => {
    setCount((c) => c + 1);
  }, 10000);

  useEffect(() => {
    window.console.log('running effect on change:', message, shouldShow);
    const removeBanner = () => {
      if (bannerId.current) {
        overlays.banners.remove(bannerId.current);
      }
      bannerId.current = undefined;
    };

    const onSeenBanner = () => {
      postMilestoneNotificationSeen(milestoneId);
      removeBanner();
    };

    if (message && shouldShow && !bannerId.current) {
      const mount = toMountPoint(
        <TrialNotificationMessage
          message={message}
          onSeenBanner={onSeenBanner}
          milestoneId={milestoneId}
        />,
        startServices
      );
      window.console.log('mounted banner with id:', bannerId.current, message, bannerId.current);
      bannerId.current = overlays.banners.replace(bannerId.current, mount, 1000);
    } else {
      removeBanner();
    } // else do nothing, keep the banner shown
  }, [overlays, startServices, message, shouldShow, milestoneId]);

  useEffect(() => {
    return () => {
      if (bannerId.current) {
        overlays.banners.remove(bannerId.current);
      }
      bannerId.current = undefined;
    };
  }, [overlays]);
};
