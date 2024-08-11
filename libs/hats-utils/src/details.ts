import _ from 'lodash';
import { AppHat, Controls, HatDetails } from 'types';

const includesKeys = (data: unknown, keys: string[]) =>
  _.every(_.keys(data), (k: unknown) => _.includes(keys, k));

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
  if (includesKeys(_.get(data, 'data'), ['data', 'type'])) {
    detailsData = _.get(data, 'data');
  } else if (includesKeys(_.get(data, 'data.data'), ['data', 'type'])) {
    detailsData = _.get(data, 'data.data');
  } else if (includesKeys(_.get(data, 'data.data.data'), ['data', 'type'])) {
    detailsData = _.get(data, 'data.data.data');
  }
  return detailsData;
};

const checkNodeDetails = (node: AppHat, type: string) =>
  node?.detailsObject?.data &&
  _.includes(_.keys(node.detailsObject.data), type);

export const checkPermissionsResponsibilities = (
  treeToDisplay: AppHat[],
  controls: Controls[],
) => {
  const hasPermissions = !_.isEmpty(
    _.filter(treeToDisplay, (node: AppHat) =>
      checkNodeDetails(node, 'permissions'),
    ),
  );
  const hasResponsibilities = !_.isEmpty(
    _.filter(treeToDisplay, (node: AppHat) =>
      checkNodeDetails(node, 'responsibilities'),
    ),
  );

  if (!hasPermissions) {
    _.remove(controls, (control: Controls) => control.value === 'permissions');
  }
  if (!hasResponsibilities) {
    _.remove(
      controls,
      (control: Controls) => control.value === 'responsibilities',
    );
  }

  return controls;
};
