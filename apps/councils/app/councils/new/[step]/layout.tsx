'use client';

import { useSearchParams } from 'next/navigation';

import { CouncilFormProvider } from '../../../../contexts/council-form';

export default function NewCouncilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');

  if (!draftId) {
    return null;
  }

  return (
    <CouncilFormProvider draftId={draftId}>{children}</CouncilFormProvider>
  );
}
