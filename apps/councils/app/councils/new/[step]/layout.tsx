'use client';

import { CouncilFormProvider } from '../../../../contexts/council-form';
import { useSearchParams } from 'next/navigation';

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
