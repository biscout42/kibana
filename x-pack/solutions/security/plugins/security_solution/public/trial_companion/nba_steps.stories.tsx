/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import type { YourTrialCompanionProps } from './nba_steps';
import { YourTrialCompanion } from './nba_steps';

const meta: Meta<typeof YourTrialCompanion> = {
  component: YourTrialCompanion,
  title: 'Security Solution/Trial Companion/Your Trial Companion',
  argTypes: {
    completed: {
      control: 'number',
      description: 'The number of steps completed',
    },
    total: {
      control: 'number',
      description: 'The total number of steps',
    },
  },
};

export default meta;

const Template: StoryFn<YourTrialCompanionProps> = (args) => {
  return <YourTrialCompanion {...args} />;
};

export const Milestone1Completed: StoryObj<YourTrialCompanionProps> = {
  render: Template,
  args: {
    completed: 1,
    total: 6,
  },
};
