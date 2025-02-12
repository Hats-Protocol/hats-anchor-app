export const PLACEHOLDERS = {
  creator_name: 'Vitalik',
  council_name: 'Protocol Council',
  org_name: 'Ethereum',
  chain_name: 'Ethereum Mainnet',
  council_members_link: 'https://hats-pro.vercel.app/',
  member_title: 'Council Member',
  compliance_title: 'Compliance Manager',
};

const MAIN_COUNCIL_FIELDS = [
  { name: 'creator_name', label: 'Creator Name' },
  { name: 'council_name', label: 'Council Name' },
  { name: 'org_name', label: 'Organization Name' },
  { name: 'chain_name', label: 'Chain Name' },
  { name: 'council_members_link', label: 'Council Members Link' },
  { name: 'compliance_title', label: 'Compliance Title' }, // what is compliance manager called
  { name: 'member_title', label: 'Member Title' }, // what is council member called
];

export const INITIAL_INVITE = {
  label: 'Initial invitation to council member',
  messageId: 'invite_council_member',
  fields: MAIN_COUNCIL_FIELDS,
};

export const INVITE_REMINDER = {
  label: 'Reminder to join a council for council member',
  messageId: 'reminder_to_join_council',
  fields: MAIN_COUNCIL_FIELDS,
};

export const NOTIFY_COMPLIANCE_MANAGER_AFTER_DEPLOY = {
  label: 'Notify compliance manager after council is deployed',
  messageId: 'notify_compliance_manager_after_deploy',
  fields: MAIN_COUNCIL_FIELDS,
};

export const COUNCIL_SETUP_COMPLETE = {
  label: 'Council setup is complete',
  messageId: 'council_setup_complete',
  fields: MAIN_COUNCIL_FIELDS,
};

export const COUNCIL_DEPLOYED = {
  label: 'Council deployed',
  messageId: 'council_deployed',
  fields: MAIN_COUNCIL_FIELDS,
};

export interface MailFormData {
  label: string;
  messageId: string;
  fields: { name: string; label: string }[];
}

export const MAIL_FORMS: MailFormData[] = [
  INITIAL_INVITE,
  INVITE_REMINDER,
  NOTIFY_COMPLIANCE_MANAGER_AFTER_DEPLOY,
  COUNCIL_SETUP_COMPLETE,
  COUNCIL_DEPLOYED,
];
