export type Filter =
  | 'all'
  | 'wearers' // all
  | 'eligible' // eligible
  | 'ineligible';

export enum FILTER {
  ALL = 'all',
  WEARER = 'wearers',
  ELIGIBLE = 'eligible',
  INELIGIBLE = 'ineligible',
}
