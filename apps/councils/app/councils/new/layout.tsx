'use client';

import { CouncilFormProvider } from '../../../contexts/council-form';

export default function NewCouncilLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CouncilFormProvider>{children}</CouncilFormProvider>;
}
