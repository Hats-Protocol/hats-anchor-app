import { useMutation } from '@tanstack/react-query';
import { Variables } from 'graphql-request';
import { CouncilMember } from 'types';
import { councilsGraphqlClient, CREATE_USER, logger, UPDATE_USER } from 'utils';

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
    logger.debug('createOrUpdateUser', data);
    try {
      if (editingId) {
        const userData = await updateUserMutation({
          id: editingId,
          address: data.address,
          email: data.email,
          name: data.name,
        });
        onEditSuccess(userData);
        return userData;
      }

      const userData = await createUserMutation(data as CouncilMember);
      onAddSuccess(userData);
      return userData;
    } catch (error) {
      onError();
      // eslint-disable-next-line no-console
      console.error('Error saving user:', error);
      return undefined;
    }
  };

  return { createOrUpdateUser };
}
