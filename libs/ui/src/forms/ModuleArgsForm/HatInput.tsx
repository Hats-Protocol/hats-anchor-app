import { Stack } from '@chakra-ui/react';
import { useTreeForm } from 'contexts';
import { AppHat } from 'hats-types';
import { decimalId } from 'hats-utils';
import _ from 'lodash';
import { ChangeEvent, useState } from 'react';
import { idToIp } from 'shared';
import { Input, Select } from 'ui';
import { transformAndVerify } from 'utils';

const HatInput = ({ arg, localForm }) => {
  const { setValue } = localForm;
  const { treeToDisplay } = useTreeForm();
  const [customHatSelections, setCustomHatSelections] = useState({});

  const handleChangeHat = (
    e: ChangeEvent<HTMLSelectElement>,
    argName: string,
  ) => {
    setCustomHatSelections((prevState) => {
      const newState = { ...prevState };

      if (e.target.value === 'custom') {
        newState[argName] = true;
      } else {
        newState[argName] = false;
        setValue(`${argName}_custom`, undefined, {
          shouldDirty: true,
        });
      }

      return newState;
    });
  };

  return (
    <Stack w='100%'>
      <Select
        name={arg.name}
        label={`${arg.name} ${arg.optional ? '(Optional)' : ''}`}
        subLabel={arg.description}
        localForm={localForm}
        placeholder='Select a hat'
        defaultValue={undefined}
        options={{
          required: !arg.optional,
          validate: (value) =>
            String(value) === 'custom' || transformAndVerify(value, arg.type),
        }}
        onChange={(e) => handleChangeHat(e, arg.name)}
      >
        <option value='custom'>Custom</option>
        {_.map(treeToDisplay, ({ id, detailsObject }: AppHat) => {
          const currentName = _.find(treeToDisplay, ['id', id])?.displayName;
          const detailsName = currentName || detailsObject?.data?.name;

          return (
            <option value={decimalId(id)} key={id}>
              {`${detailsName ? `${detailsName} - ` : ''}${idToIp(id)}`}
            </option>
          );
        })}
      </Select>
      {customHatSelections[arg.name] && (
        <Input
          name={`${arg.name}_custom`}
          label='Custom Hat ID'
          placeholder='e.g. 285.1.3'
          localForm={localForm}
          options={{
            required: !arg.optional,
            // validation - check if the hat exists
          }}
        />
      )}
    </Stack>
  );
};

export default HatInput;
