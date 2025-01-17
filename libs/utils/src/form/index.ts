import _, { get, isString, isUndefined, map, omit } from 'lodash';
import { createHierarchy, idToIp } from 'shared';
import { AppHat, FieldItem, FormData, FormFieldKeys, HatsCalls, InputObject } from 'types';
import { Hex } from 'viem';

export * from './misc';
export * from './multicall';

export const removeAndHandleSiblings = (storedData: Partial<FormData>[], hatId: Hex) => {
  const storedHat = _.find(storedData, ['id', hatId]);
  const hierarchy = createHierarchy(storedData as unknown as InputObject[], hatId);

  const noEmptyChanges = _.reject(storedData, (d: Partial<FormData>) =>
    _.isEmpty(_.reject(_.keys(d), (k: string) => k === 'id')),
  );

  const newSiblings = _.filter(noEmptyChanges, ['parentId', storedHat?.parentId]);

  const updateSiblings = _.map(newSiblings, (child: { id: Hex }, i: number) => {
    const childId = child.id;
    if (i === newSiblings.length - 1 || !childId) return undefined;

    const isLeftSib = _.includes(_.get(hierarchy, 'leftSiblings'), childId);
    if (isLeftSib) return child;

    return { ...newSiblings[i + 1], id: childId };
  });

  const filterSiblings = _.reject(storedData, (child: Partial<FormData>) =>
    _.includes(_.map(newSiblings, 'id'), child.id),
  );
  const filterCurrentHat = _.reject(filterSiblings, { id: hatId });

  return _.concat(filterCurrentHat, _.compact(updateSiblings) as unknown as Partial<FormData>[]);
};

export const removeAndHandleSiblingsOrgChart = (hats: AppHat[], hatId: Hex) => {
  const orgChartHat = _.find(hats, ['id', hatId]);
  const newSiblings = _.filter(hats, ['parentId', orgChartHat?.parentId]);

  const updateSiblings = _.map(newSiblings, (child: { id: Hex }, i: number) => {
    if (i + 1 === newSiblings.length) return undefined;

    // TODO do we need to handle left siblings here?
    return { ...newSiblings[i + 1], id: child.id };
  });

  const filterSiblings = _.reject(hats, (child: AppHat) =>
    _.includes(_.concat(_.map(newSiblings, 'id'), [orgChartHat?.id]), child.id),
  );

  return _.concat(filterSiblings, _.compact(updateSiblings));
};

// TODO move to consts
const EXCLUDE_KEYS = ['id', 'parentId', 'adminId', 'imageUri', 'moduleInfo'];
const EXCLUDE_ADDRESS_INPUT_KEYS = ['eligibility-input', 'toggle-input'];

export const getExcludedFields = (includeInputs = false) => {
  let localKeys = EXCLUDE_KEYS;
  if (includeInputs) {
    localKeys = _.concat(EXCLUDE_KEYS, EXCLUDE_ADDRESS_INPUT_KEYS);
  }

  return localKeys;
};

// get dirty fields
export const getDirtyFields = (
  formValues: Partial<FormData>,
  defaultFormValues: Partial<FormData>,
  includeInputs = false,
): string[] => {
  const localKeys = getExcludedFields(includeInputs);

  return _.filter(_.keys(formValues), (key: FormFieldKeys) => {
    if (_.includes(localKeys, key)) return false;
    if (key === 'imageUrl') {
      return formValues.imageUrl !== defaultFormValues.imageUrl && formValues.imageUrl !== undefined;
    }

    const initialDefaultVal = get(defaultFormValues, key);
    const defaultVal =
      isString(initialDefaultVal) ||
        typeof initialDefaultVal === 'number' ||
        typeof initialDefaultVal === 'boolean' ||
        isUndefined(initialDefaultVal)
        ? initialDefaultVal
        : JSON.stringify(map(initialDefaultVal, (item: any) => omit(item, ['moduleInfo'])));
    const initialFormVal = get(formValues, key);
    const compareVal =
      isString(initialFormVal) ||
        typeof initialFormVal === 'number' ||
        typeof initialFormVal === 'boolean' ||
        isUndefined(initialFormVal)
        ? initialFormVal
        : JSON.stringify(map(initialFormVal, (item: any) => omit(item, ['moduleInfo'])));

    return defaultVal !== compareVal;
  }) as string[];
};

export const fieldsAreDirty = (fieldsArray: FieldItem[], dirtyFields: string[]) => {
  return _.map(
    _.filter(fieldsArray, (field: FieldItem) => _.includes(dirtyFields, field.name as string)),
    'label',
  );
};

export function summarizeActions(data: HatsCalls[]) {
  if (_.isEmpty(data)) return 'No actions taken';

  let createCount = 0;
  let updateCount = 0;
  let mintCount = 0;

  _.forEach(data, (item: HatsCalls) => {
    let isCreated = false;
    // const

    _.forEach(item.calls, (call: unknown) => {
      switch ((call as { functionName: string }).functionName) {
        case 'createHat':
          isCreated = true;
          createCount += 1;
          break;
        case 'mintHat':
          mintCount += 1;
          break;
        case 'batchMintHats':
          {
            const hatChanges = _.get(item, 'hatChanges');
            const wearersCount = hatChanges ? _.size(_.get(hatChanges as { wearers: unknown[] }, 'wearers')) : 0;
            mintCount += wearersCount;
          }
          break;
        default:
          // If the hat is not created in this item, count this call as an update
          if (!isCreated) {
            updateCount += 1;
          }
          break;
      }
    });
  });

  if (data.length === 1) {
    let message = '';
    if (createCount === 1) {
      // TODO which hat
      return `Created a hat`;
    }
    if (updateCount > 0) {
      message += `Updated details of hat #${idToIp(data[0].hatId)}`;
    }
    if (mintCount > 0) {
      const wearers = `${mintCount === 1 ? '1 wearer' : `${mintCount} wearers`}`;
      message += updateCount > 0 ? `& minted to ${wearers}` : `Minted to ${wearers}`;
    }
    return message;
  }

  const actionParts: string[] = [];
  if (updateCount > 0) actionParts.push(`Updated ${updateCount} ${updateCount === 1 ? 'hat' : 'hats'}`);
  if (createCount > 0) actionParts.push(`Created ${createCount} ${createCount === 1 ? 'hat' : 'hats'}`);
  if (mintCount > 0) actionParts.push(`Minted ${mintCount} ${mintCount === 1 ? 'hat' : 'hats'}`);
  const multiMessage = `${actionParts.join(' & ')} (Multicall)`;

  return multiMessage;
}
