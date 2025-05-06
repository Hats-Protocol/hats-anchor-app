import { isEmpty } from 'lodash';
import { MemberAvatar } from 'ui';

interface RoleSummaryProps {
  title: string;
  description?: string;
  members: { id: string; address: string; name?: string }[];
}

export const RoleSummary = ({ title, description, members }: RoleSummaryProps) => (
  <div className='space-y-2'>
    <div>
      <h4 className='text-base font-bold text-gray-900'>{title}</h4>
      {description && <p className='text-sm text-gray-600'>{description}</p>}
    </div>

    {!isEmpty(members) ? (
      <div className='space-y-2'>
        {members.map((member) => (
          <MemberAvatar key={member.id} member={member} />
        ))}
      </div>
    ) : (
      <div className='text-sm text-gray-600'>No members</div>
    )}
  </div>
);
