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
  useEuiTheme,
  EuiIcon,
  EuiSpacer,
  EuiButton,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { useKibana } from '../common/lib/kibana';
import type { Milestone } from '../../common/trial_companion/types';
import type { NBAAction, NBATODOItem } from './nba_translations';
import RadioCircleIconSVG from './radio_circle_icon.svg';

// TODO: rename this file

export interface YourTrialCompanionProps {
  completed: Milestone[];
  todoItems: NBATODOItem[];
}

export interface YourTrialCompanionTODOItemProps {
  item: NBATODOItem;
  completed: Milestone[];
}

function buttonContent(completed: number, total: number) {
  return (
    <>
      <EuiTitle size="xs">
        <h4>
          <FormattedMessage
            id="xpack.securitySolution.trialNotifications.yourTrialCompanion.title"
            defaultMessage="Get set up"
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

function itemButtonContent(iconType: string, color: string, title: string) {
  return (
    <div>
      <EuiTitle size="xs" css={{ fontWeight: 'normal' }}>
        <div>
          <EuiIcon type={iconType} size="m" color={color} />
          &nbsp;
          <FormattedMessage
            id="xpack.securitySolution.trialNotifications.yourTrialCompanion.item.title"
            defaultMessage="{title}"
            values={{ title }}
          />
        </div>
      </EuiTitle>
    </div>
  );
}

const YourTrialCompanionTODOItem: React.FC<YourTrialCompanionTODOItemProps> = ({
  item,
  completed,
}) => {
  const { ...startServices } = useKibana().services;
  const iconType = completed.includes(item.milestoneId)
    ? 'checkInCircleFilled'
    : RadioCircleIconSVG;
  const color = completed.includes(item.milestoneId) ? 'success' : 'default';
  const accordionId = useGeneratedHtmlId({
    prefix: 'yourTrialCompanionAccordionTODOItem',
    suffix: item.milestoneId.toString(),
  });
  const action: NBAAction | undefined = item.translate.apps?.[0];
  const viewButtonText = action?.text;
  const onViewButton = () => {
    if (action) {
      startServices.application.navigateToApp(action.app);
    }
  };

  return (
    <>
      <EuiSpacer size="s" />
      <EuiAccordion
        id={accordionId}
        buttonContent={itemButtonContent(iconType, color, item.translate.title)}
        arrowDisplay="right"
      >
        <EuiSpacer size="s" />
        <FormattedMessage
          id="xpack.securitySolution.trialNotifications.trialNotification.message"
          defaultMessage="{message}"
          values={{ message: item.translate.message }}
        />
        {action && viewButtonText && (
          <>
            <EuiSpacer size="s" />
            <EuiButton
              size="s"
              onClick={onViewButton}
              fill={true}
              data-test-subj="trial-companion-view-button"
            >
              <FormattedMessage
                id="xpack.securitySolution.trialNotifications.trialNotification.viewButton"
                defaultMessage="{viewButtonText}"
                values={{ viewButtonText }}
              />
            </EuiButton>
          </>
        )}
      </EuiAccordion>
    </>
  );
};

export const YourTrialCompanion: React.FC<YourTrialCompanionProps> = ({
  completed,
  todoItems,
}: YourTrialCompanionProps) => {
  const accordionId = useGeneratedHtmlId({ prefix: 'yourTrialCompanionAccordion' });
  const { euiTheme } = useEuiTheme();
  const styles = css({
    zIndex: euiTheme.levels.header,
    position: 'absolute',
    bottom: '2%',
    maxWidth: '400px',
    left: euiTheme.size.base,
    '.euiAccordion__buttonContent': {
      width: '100%;',
    },
  });

  return (
    <EuiPanel css={styles}>
      <EuiAccordion
        id={accordionId}
        buttonContent={buttonContent(completed.length, todoItems.length)}
        arrowDisplay="right"
        paddingSize="s"
      >
        {todoItems.map((item) => {
          return <YourTrialCompanionTODOItem item={item} completed={completed} />;
        })}
      </EuiAccordion>
    </EuiPanel>
  );
};
