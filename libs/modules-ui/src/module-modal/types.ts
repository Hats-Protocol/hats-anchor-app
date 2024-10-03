export type Filter =
  | 'all'
  | 'wearer' // all
  | 'eligible' // eligible
  | 'ineligible';

export enum FILTER {
  ALL = 'all',
  WEARER = 'wearer',
  ELIGIBLE = 'eligible',
  INELIGIBLE = 'ineligible',
}
