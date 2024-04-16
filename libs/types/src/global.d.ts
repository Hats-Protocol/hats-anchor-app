declare module '@next/bundle-analyzer';
declare module 'd3';
declare module 'lodash';
declare module 'opepen-standard';
declare module 'papaparse';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}
