/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { css } from '@emotion/react';
import {
  EuiPanel,
  EuiProgress,
  EuiTitle,
  EuiAccordion,
  useGeneratedHtmlId,
  EuiListGroup,
  useEuiTheme,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';

export interface YourTrialCompanionProps {
  completed: number;
  total: number;
}

const myContent = [
  {
    label: 'Add an integration',
    onClick: () => {},
    iconType: 'database',
  },
  {
    label: 'Explore your data in Discover',
    onClick: () => {},
    iconType: 'dashboardApp',
  },
  {
    label: 'Preview and enable rules',
    onClick: () => {},
    iconType: 'securitySignal',
  },
  {
    label: 'Investigate an alert',
    onClick: () => {},
    iconType: 'bolt',
  },
  {
    label: 'Create case',
    onClick: () => {},
    iconType: 'reportingApp',
  },
];

function buttonContent(completed: number, total: number) {
  return (
    <>
      <EuiTitle size="xs">
        <h4>
          <FormattedMessage
            id="xpack.securitySolution.trialNotifications.yourTrialCompanion.title"
            defaultMessage="Getting Started"
          />
        </h4>
      </EuiTitle>
      <FormattedMessage
        id="xpack.securitySolution.trialNotifications.yourTrialCompanion.stepsCompleted"
        defaultMessage="{completed}/{total} steps completed"
        values={{ completed, total }}
      />
      <EuiProgress value={completed} max={total} size="m" />
    </>
  );
}

export const YourTrialCompanion: React.FC<YourTrialCompanionProps> = ({
  completed,
  total,
}: YourTrialCompanionProps) => {
  const accordionId = useGeneratedHtmlId({ prefix: 'yourTrialCompanionAccordion' });
  const { euiTheme } = useEuiTheme();
  const styles = css({
    zIndex: euiTheme.levels.header,
    position: 'absolute',
    bottom: '5%',
    left: euiTheme.size.base,
    '.euiAccordion__buttonContent': {
      width: '100%;',
    },
  });

  return (
    <EuiPanel css={styles}>
      <EuiAccordion
        id={accordionId}
        buttonContent={buttonContent(completed, total)}
        arrowDisplay="right"
      >
        <EuiListGroup listItems={myContent} size="s" />
      </EuiAccordion>
    </EuiPanel>
  );
};
