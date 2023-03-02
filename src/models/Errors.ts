import { Entity } from '@rest-hooks/rest';
import { SingletonEntity } from 'api/resources/Base/Singleton';

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type ExperimentType = string;
export type TotalDataCollections = number;
export type FailedDataCollections = number;
export type Failedpercent = number;
export type AbortedDataCollections = number;
export type Abortedpercent = number;
export type FrequencyOfThisErrorMessage = number;
export type TheErrorMessage = string;
export type ErrorMessages = ExperimentTypeMessages[];
export type Totals = ExperimentTypeGroup[];

export interface Errors {
  totals: Totals;
}
export interface ExperimentTypeGroup {
  experimentType: ExperimentType;
  total: TotalDataCollections;
  failed: FailedDataCollections;
  failedPercent?: Failedpercent;
  aborted: AbortedDataCollections;
  abortedPercent?: Abortedpercent;
  messages: ErrorMessages;
}
export interface ExperimentTypeMessages {
  count: FrequencyOfThisErrorMessage;
  message: TheErrorMessage;
}


export abstract class ErrorsBase extends Entity {
  totals: Totals;
}

export abstract class ErrorsSingletonBase extends SingletonEntity {
  totals: Totals;
}

export abstract class ExperimentTypeGroupBase extends Entity {
  experimentType: ExperimentType;
  total: TotalDataCollections;
  failed: FailedDataCollections;
  failedPercent?: Failedpercent;
  aborted: AbortedDataCollections;
  abortedPercent?: Abortedpercent;
  messages: ErrorMessages;
}

export abstract class ExperimentTypeGroupSingletonBase extends SingletonEntity {
  experimentType: ExperimentType;
  total: TotalDataCollections;
  failed: FailedDataCollections;
  failedPercent?: Failedpercent;
  aborted: AbortedDataCollections;
  abortedPercent?: Abortedpercent;
  messages: ErrorMessages;
}

export abstract class ExperimentTypeMessagesBase extends Entity {
  count: FrequencyOfThisErrorMessage;
  message: TheErrorMessage;
}

export abstract class ExperimentTypeMessagesSingletonBase extends SingletonEntity {
  count: FrequencyOfThisErrorMessage;
  message: TheErrorMessage;
}

