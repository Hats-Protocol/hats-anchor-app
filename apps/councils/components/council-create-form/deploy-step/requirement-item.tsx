interface RequirementItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const RequirementItem = ({ icon, title, description }: RequirementItemProps) => (
  <div className='flex items-center gap-3'>
    <div className='flex-shrink-0 rounded-full border border-gray-200 p-2 text-gray-900'>{icon}</div>
    <div>
      <p className='font-medium text-gray-900'>{title}</p>
      <p className='text-primary-900 text-sm'>{description}</p>
    </div>
  </div>
);
