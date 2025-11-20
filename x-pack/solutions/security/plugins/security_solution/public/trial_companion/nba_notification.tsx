/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiButton, EuiCallOut } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import type { MilestoneID } from '../../common/trial_companion/types';
import { ALL_NBA } from '../../common/trial_companion/constants';

interface Props {
  milestoneId: MilestoneID;
  onSeenBanner: () => void;
  onViewButton: () => void;
}
export const NBANotification: React.FC<Props> = ({ milestoneId, onSeenBanner, onViewButton }) => {
  return (
    <EuiCallOut
      announceOnMount
      iconType="cheer"
      title={
        <FormattedMessage
          id="xpack.securitySolution.trialNotifications.trialNotification.title"
          defaultMessage="{title}"
          values={{ title: ALL_NBA[milestoneId].title }}
        />
      }
    >
      <FormattedMessage
        id="xpack.securitySolution.trialNotifications.trialNotification.message"
        defaultMessage="{message}"
        values={{ message: ALL_NBA[milestoneId].message }}
      />
      {ALL_NBA[milestoneId].app && (
        <EuiButton size="s" onClick={onViewButton} color="success" style={{ marginRight: '8px' }}>
          <FormattedMessage
            id="xpack.securitySolution.trialNotifications.trialNotification.viewButton"
            defaultMessage="Go to app"
          />
        </EuiButton>
      )}
      <EuiButton size="s" onClick={onSeenBanner} color="success">
        <FormattedMessage
          id="xpack.securitySolution.trialNotifications.trialNotification.dismissButton"
          defaultMessage="Don't show again"
        />
      </EuiButton>
    </EuiCallOut>
  );
};
