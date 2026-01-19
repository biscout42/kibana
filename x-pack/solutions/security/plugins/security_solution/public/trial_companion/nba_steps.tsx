/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState } from 'react';
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
  EuiButtonEmpty,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { useKibana } from '../common/lib/kibana';
import type { Milestone } from '../../common/trial_companion/types';
import type { NBAAction, NBATODOItem } from './nba_translations';
import RadioCircleIconSVG from './radio_circle_icon.svg';

// TODO: rename this file
// TODO: unit tests

export interface YourTrialCompanionProps {
  open: Milestone[];
  todoItems: NBATODOItem[];
}

export interface YourTrialCompanionTODOItemProps {
  item: NBATODOItem;
  completed: Milestone[];
  setExpandedItemId: (id: Milestone | null) => void;
  trigger: 'open' | 'closed';
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
  setExpandedItemId,
  trigger,
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
  const onToggle = (isOpen: boolean) => {
    if (isOpen) {
      setExpandedItemId(item.milestoneId);
    } else {
      setExpandedItemId(null);
    }
  };

  return (
    <>
      <EuiSpacer size="s" />
      <EuiAccordion
        id={accordionId}
        buttonContent={itemButtonContent(iconType, color, item.translate.title)}
        arrowDisplay="right"
        borders={trigger === 'open' ? 'horizontal' : 'none'}
        buttonProps={{ paddingSize: 's' }}
        paddingSize="s"
        onToggle={onToggle}
        forceState={trigger}
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

function completedTODOs(todoList: NBATODOItem[], open: Milestone[]): Milestone[] {
  return todoList
    .map((item) => item.milestoneId)
    .filter((milestoneId) => !open.includes(milestoneId));
}

export const YourTrialCompanion: React.FC<YourTrialCompanionProps> = ({
  open,
  todoItems,
}: YourTrialCompanionProps) => {
  const accordionId = useGeneratedHtmlId({ prefix: 'yourTrialCompanionAccordion' });
  const { euiTheme } = useEuiTheme();
  const completed = completedTODOs(todoItems, open);
  const [expandedItemId, setExpandedItemId] = useState<Milestone | null>(null);
  const styles = css({
    zIndex: euiTheme.levels.header,
    position: 'fixed',
    bottom: '5%',
    maxWidth: '400px',
    left: `calc(var(--kbn-layout--navigation-width) + ${euiTheme.size.base})`,
    '.euiAccordion__buttonContent': {
      width: '100%;',
    },
  });
  const [isVisible, setIsVisible] = useState(true);

  return (
    isVisible && (
      <EuiPanel css={styles}>
        <EuiAccordion
          id={accordionId}
          buttonContent={buttonContent(completed.length, todoItems.length)}
          arrowDisplay="right"
          paddingSize="s"
        >
          {todoItems.map((item) => {
            return (
              <YourTrialCompanionTODOItem
                item={item}
                completed={completed}
                setExpandedItemId={setExpandedItemId}
                trigger={expandedItemId === item.milestoneId ? 'open' : 'closed'}
              />
            );
          })}
          <EuiSpacer size="s" />
          <EuiButtonEmpty
            onClick={() => {
              setIsVisible(false);
            }}
          >
            <FormattedMessage
              id="xpack.securitySolution.trialNotifications.yourTrialCompanion.hideMe"
              defaultMessage="Hide Me"
            />
          </EuiButtonEmpty>
        </EuiAccordion>
      </EuiPanel>
    )
  );
};
