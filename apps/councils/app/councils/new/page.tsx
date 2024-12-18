import { redirect } from 'next/navigation';
import { councilsGraphqlClient, CREATE_INITIAL_FORM } from 'utils';

// Make the route dynamic
export const dynamic = 'force-dynamic';

const NewCouncil = async () => {
  const result: {
    createCouncilCreationForm: {
      id: string;
    };
  } = await councilsGraphqlClient.request(CREATE_INITIAL_FORM);
  const formId = result.createCouncilCreationForm.id;

  return redirect(`/councils/new/details?draftId=${formId}`);
};

export default NewCouncil;
