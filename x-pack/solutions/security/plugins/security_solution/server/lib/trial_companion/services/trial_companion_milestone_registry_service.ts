/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  Logger,
  SavedObject,
  SavedObjectsClientContract,
  SavedObjectsServiceStart,
} from '@kbn/core/server';
import type {
  MilestoneID,
  TrialCompanionMilestone,
  TrialCompanionMilestoneRegistryService,
} from '../types';
import { type MilestoneSavedObjectAttributes, MILESTONE_SAVED_OBJECT_TYPE } from '../saved_objects';

function toMilestone(result: SavedObject<MilestoneSavedObjectAttributes>): TrialCompanionMilestone {
  return {
    id: result.attributes.milestoneId as MilestoneID,
    message: result.attributes.message,
    savedObjectId: result.id,
  } as TrialCompanionMilestone;
}

export class TrialCompanionMilestoneRegistryServiceImpl
  implements TrialCompanionMilestoneRegistryService
{
  private readonly logger: Logger;
  private soClient?: SavedObjectsClientContract | null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public start(savedObjects: SavedObjectsServiceStart) {
    this.soClient =
      savedObjects.createInternalRepository() as unknown as SavedObjectsClientContract;
  }

  async getCurrent(): Promise<TrialCompanionMilestone | undefined> {
    const response = await this.savedObjectsClient().find<MilestoneSavedObjectAttributes>({
      type: MILESTONE_SAVED_OBJECT_TYPE,
    });
    if (response.total === 0) {
      return undefined;
    }

    const result = response.saved_objects[0];
    return toMilestone(result);
  }

  async save(milestone: TrialCompanionMilestone): Promise<void> {
    const response = await this.savedObjectsClient().update<MilestoneSavedObjectAttributes>(
      MILESTONE_SAVED_OBJECT_TYPE,
      milestone.savedObjectId,
      {
        milestoneId: milestone.id,
        message: milestone.message,
      }
    );

    this.logger.info(
      `Saved milestone with id ${response.id} and milestoneId ${milestone.id}. Response: ${response}`
    );
  }

  private savedObjectsClient(): SavedObjectsClientContract {
    if (this.soClient === undefined || this.soClient === null) {
      throw Error('saved objects client is unavailable');
    }
    return this.soClient;
  }

  async create(id: MilestoneID, message: string): Promise<TrialCompanionMilestone> {
    const response = await this.savedObjectsClient().create<MilestoneSavedObjectAttributes>(
      MILESTONE_SAVED_OBJECT_TYPE,
      {
        milestoneId: id,
        message,
      }
    );

    return toMilestone(response);
  }
}
