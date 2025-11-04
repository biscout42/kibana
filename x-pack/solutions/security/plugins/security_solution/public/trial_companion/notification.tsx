/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useRef } from 'react';
import { toMountPoint } from '@kbn/react-kibana-mount';
import { EuiButton, EuiCallOut, EuiSpacer } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { useKibana } from '../common/lib/kibana';
import { useGetNotification } from './hooks/use_get_notification';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

export const TrialNotification: React.FC<Props> = () => {
  const { overlays, ...startServices } = useKibana().services;

  // TODO: call back-end  / useAsync / fetchNotification. Put it to useNotifications
  // TODO: why to use memo for services, see https://github.com/elastic/kibana/commit/6f89bd542bf80e68d128ed6ce09db4ed15855511#diff-2425eabbda427442eccf29ed61395290a09b082ac4cbce092ccdb2cf4ed72946R26-R35
  // TODO: lazy load component

  const bannerId = useRef<string | undefined>();

  const { message, error, loading } = useGetNotification();

  useEffect(
    function handleNotification() {
      if (loading) {
        window.console.log('loading notification banner...');
        return;
      }

      if (error) {
        window.console.error('error fetching notification message:', error);
        return;
      }

      const onSeenBanner = () => {
        if (bannerId.current) {
          overlays.banners.remove(bannerId.current);
        }
      };
      const mount = toMountPoint(
        <EuiCallOut
          announceOnMount
          color="success"
          iconType="cheer"
          title={
            <FormattedMessage
              id="xpack.securitySolution.trialNotifications.trialNotification.title"
              defaultMessage="Notification message title 2"
            />
          }
        >
          <FormattedMessage
            id="xpack.securitySolution.trialNotifications.trialNotification.message"
            defaultMessage="Tada: {message}"
            values={{ message }}
          />
          <EuiSpacer size="s" />
          <EuiButton size="s" onClick={onSeenBanner} color="success">
            <FormattedMessage
              id="xpack.securitySolution.trialNotifications.trialNotification.dismissButton"
              defaultMessage="Dismiss"
            />
          </EuiButton>
        </EuiCallOut>,
        startServices
      );
      bannerId.current = overlays.banners.replace(bannerId.current, mount, 1000);
      window.console.log('mounted banner with id:', bannerId.current);
      return () => {
        // unmount
        window.console.log('unmounted banner with id:', bannerId.current);
        if (bannerId.current) {
          overlays.banners.remove(bannerId.current);
        }
      };
    },
    [overlays, startServices, message, error, loading]
  );

  return null;
};
