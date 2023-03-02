/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Proposalid = string;
export type Name = string;
export type Acronym = string;
export type Proteinid = number;

export interface SampleProtein {
  proposalId: Proposalid;
  name: Name;
  acronym: Acronym;
  proteinId: Proteinid;
}

type Constructor<T = {}> = new (...args: any[]) => T;
export function withSampleProtein<TBase extends Constructor>(Base: TBase) {
  return class WithSampleProtein extends Base {
    proposalId: Proposalid;
    name: Name;
    acronym: Acronym;
    proteinId: Proteinid;
  }
}
