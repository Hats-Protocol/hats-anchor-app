import { find, map, some } from 'lodash';
import { ReactNode, useMemo } from 'react';
import { Button } from 'ui';

interface Section {
  label: string;
  value: boolean;
  hasRole: boolean;
  section: ReactNode;
}

interface ManageButton {
  label: string;
  onClick: () => void;
  colorScheme?: string;
  hasRole?: boolean;
  section?: string;
}

interface ManageBarProps {
  sections: Section[];
  buttons: ManageButton[];
}

export const ManageBar = ({ sections, buttons }: ManageBarProps) => {
  const activeSection = useMemo(() => {
    return find(sections, (s) => s.value);
  }, [sections]);
  const hasAnyRole = useMemo(() => {
    return some(sections, ({ hasRole }) => hasRole) || some(buttons, ({ hasRole }) => hasRole);
  }, [sections, buttons]);

  if (activeSection) {
    return (
      <div className='absolute bottom-0 min-h-[100px] w-full border-b border-t border-black/20 bg-white/90 py-4 md:py-10'>
        {activeSection.section}
      </div>
    );
  }

  if (!hasAnyRole) return null;

  return (
    <div className='absolute bottom-0 min-h-[100px] w-full rounded-br-xl border-b border-t border-black/20 bg-white/90 py-4 md:py-10'>
      <div className='flex w-full items-center justify-center'>
        <div className='flex gap-4'>
          {map(buttons, ({ onClick, label, colorScheme }) => (
            <Button
              variant='outline-blue'
              // colorScheme={colorScheme || 'blue.500'}
              size='sm'
              onClick={onClick}
              key={label}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
