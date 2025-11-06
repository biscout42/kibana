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
  milestoneId: number;
}

export const TrialNotificationMessage: React.FC<Props> = ({
  message,
  onSeenBanner,
  milestoneId,
}) => {
  return (
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
        defaultMessage="{milestoneId} :Tada: {message}"
        values={{ milestoneId, message }}
      />
      <EuiSpacer size="s" />
      <EuiButton size="s" onClick={onSeenBanner} color="success">
        <FormattedMessage
          id="xpack.securitySolution.trialNotifications.trialNotification.dismissButton"
          defaultMessage="Dismiss"
        />
      </EuiButton>
    </EuiCallOut>
  );
};
