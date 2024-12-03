import { redirect } from 'next/navigation';

const CouncilPage = ({ params: { id } }: { params: { id: string } }) => {
  return redirect(`/councils/${id}/transactions`);
};

export default CouncilPage;
