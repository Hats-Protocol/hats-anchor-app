import { redirect } from 'next/navigation';

const CouncilPage = ({
  params: { identifier },
}: {
  params: { identifier: string };
}) => {
  return redirect(`/councils/${identifier}/transactions`);
};

export default CouncilPage;
