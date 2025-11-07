/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiButton, EuiCallOut, EuiSpacer } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';

interface Props {
  message: string;
  onSeenBanner: () => void;
  title: string;
  onViewButton: () => void;
}

export const TrialNotificationMessage: React.FC<Props> = ({
  message,
  onSeenBanner,
  title,
  onViewButton,
}) => {
  return (
    <EuiCallOut
      announceOnMount
      color="success"
      iconType="cheer"
      title={
        <FormattedMessage
          id="xpack.securitySolution.trialNotifications.trialNotification.title"
          defaultMessage="{title}"
          values={{ title }}
        />
      }
    >
      <FormattedMessage
        id="xpack.securitySolution.trialNotifications.trialNotification.message"
        defaultMessage="{message}"
        values={{ message }}
      />
      <EuiSpacer size="s" />
      <EuiButton size="s" onClick={onViewButton} color="success" style={{ marginRight: '8px' }}>
        <FormattedMessage
          id="xpack.securitySolution.trialNotifications.trialNotification.viewButton"
          defaultMessage="View"
        />
      </EuiButton>
      <EuiButton size="s" onClick={onSeenBanner} color="success">
        <FormattedMessage
          id="xpack.securitySolution.trialNotifications.trialNotification.dismissButton"
          defaultMessage="Don't show again"
        />
      </EuiButton>
    </EuiCallOut>
  );
};
