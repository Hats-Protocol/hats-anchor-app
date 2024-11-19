import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const NewCouncil = () => {
  const draftId = uuidv4();
  return redirect(`/councils/new/details?draftId=${draftId}`);
};

export default NewCouncil;
