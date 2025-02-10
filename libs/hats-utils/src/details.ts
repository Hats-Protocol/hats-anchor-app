import { every, filter, get, includes, isEmpty, keys, remove } from 'lodash';
import { AppHat, Controls, HatDetails } from 'types';

const includesKeys = (data: unknown, localKeys: string[]) => every(keys(data), (k: unknown) => includes(localKeys, k));

export interface DetailsData {
  type: string;
  data: HatDetails;
}

// TODO - this is a temporary solution to handle nested details data, check to see if still needed
/**
 * Extracts nested details data from a response object
 */
export const handleNestedDetails = (data: unknown): DetailsData | undefined => {
  let detailsData: DetailsData | undefined;
  if (includesKeys(get(data, 'data'), ['data', 'type'])) {
    detailsData = get(data, 'data');
  } else if (includesKeys(get(data, 'data.data'), ['data', 'type'])) {
    detailsData = get(data, 'data.data');
  } else if (includesKeys(get(data, 'data.data.data'), ['data', 'type'])) {
    detailsData = get(data, 'data.data.data');
  }
  return detailsData;
};

const checkNodeDetails = (node: AppHat, type: string) =>
  node?.detailsObject?.data && includes(keys(node.detailsObject.data), type);

export const checkPermissionsResponsibilities = (treeToDisplay: AppHat[], controls: Controls[]) => {
  const hasPermissions = !isEmpty(filter(treeToDisplay, (node: AppHat) => checkNodeDetails(node, 'permissions')));
  const hasResponsibilities = !isEmpty(
    filter(treeToDisplay, (node: AppHat) => checkNodeDetails(node, 'responsibilities')),
  );

  if (!hasPermissions) {
    remove(controls, (control: Controls) => control.value === 'permissions');
  }
  if (!hasResponsibilities) {
    remove(controls, (control: Controls) => control.value === 'responsibilities');
  }

  return controls;
};
