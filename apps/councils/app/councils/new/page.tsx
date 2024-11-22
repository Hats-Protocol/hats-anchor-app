import { redirect } from 'next/navigation';
import { graphqlClient } from '../../../lib/graphql-client';
import { CREATE_INITIAL_FORM } from '../../../lib/graphql/council-form';

const NewCouncil = async () => {
  const result: {
    createCouncilCreationForm: {
      id: string;
    };
  } = await graphqlClient.request(CREATE_INITIAL_FORM);
  const formId = result.createCouncilCreationForm.id;

  return redirect(`/councils/new/details?draftId=${formId}`);
};

export default NewCouncil;
