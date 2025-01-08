import { useMutation } from '@tanstack/react-query';
import { Variables } from 'graphql-request';
import { CouncilMember } from 'types';
import { councilsGraphqlClient } from 'utils';

const CREATE_USER = `
  mutation CreateUser($address: String!, $email: String!, $name: String) {
    createUser(address: $address, email: $email, name: $name) {
      id
      address
      email
      name
    }
  }
`;

const UPDATE_USER = `
  mutation UpdateUser($id: ID!, $address: String!, $email: String!, $name: String) {
    updateUser(id: $id, address: $address, email: $email, name: $name) {
      id
      address 
      email
      name
    }
  }
`;

export function useCreateOrUpdateUser({
  editingId,
  onAddSuccess,
  onEditSuccess,
  onError,
}: {
  editingId: string | undefined;
  onAddSuccess: (data: CouncilMember) => void;
  onEditSuccess: (data: CouncilMember) => void;
  onError: () => void;
}) {
  const { mutateAsync: createUserMutation } = useMutation({
    mutationFn: async (variables: Partial<CouncilMember>) => {
      const result = await councilsGraphqlClient.request<{
        createUser: CouncilMember;
      }>(CREATE_USER, variables as unknown as Variables);
      return result.createUser;
    },
  });

  const { mutateAsync: updateUserMutation } = useMutation({
    mutationFn: async (variables: Partial<CouncilMember>) => {
      const result = await councilsGraphqlClient.request<{
        updateUser: CouncilMember;
      }>(UPDATE_USER, variables as unknown as Variables);
      return result.updateUser;
    },
  });

  const createOrUpdateUser = async (data: CouncilMember) => {
    console.log('createOrUpdateUser', data);
    try {
      let userData;

      if (editingId) {
        userData = await updateUserMutation({
          id: editingId,
          address: data.address,
          email: data.email,
          name: data.name,
        });
      } else {
        userData = await createUserMutation(data as CouncilMember);
      }

      if (editingId) {
        onEditSuccess(userData);
      } else {
        onAddSuccess(userData);
      }

      // return for any consumers that need the user data back
      return userData;
    } catch (error) {
      onError();
      // eslint-disable-next-line no-console
      console.error('Error saving user:', error);
    }
  };

  return { createOrUpdateUser };
}
