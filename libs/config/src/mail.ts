import { concat } from 'lodash';

export const PLACEHOLDERS = {
  creatorName: 'Vitalik',
  creatorEmail: 'vitalik@ethereum.org',
  councilName: 'Protocol Council',
  orgName: 'Ethereum',
  chainName: 'Ethereum Mainnet',
  councilMembersLink: 'https://hats-pro.vercel.app/',
  councilSafeLink: 'https://app.safe.global/',
  subscriptionInfo: '0.1 ETH per month via invoice',
  deployTransactionLink: 'https://etherscan.io/tx/0x',
  // copy
  memberTitle: 'Council Member',
  memberName: 'member',
  complianceTitle: 'Compliance Manager',
  councilTitle: 'council',
  councilTitleUpper: 'Council',
  complianceManagerAccessory: 'a', // `a` for several managers or `the` for a single manager
};

export const COUNCIL_COPY_FIELDS = [
  // copy
  { name: 'complianceTitle', label: 'Compliance Title' }, // default "Compliance Manager", what is compliance manager called
  { name: 'memberTitle', label: 'Member Title' }, // default "Council Member", what is council member called, formal
  { name: 'memberName', label: 'Member Name' }, // default "member", used to follow {COUNCIL_TITLE} {MEMBER_NAME}
  { name: 'councilTitle', label: 'Council Title' }, // default "council", copy for the "Council"
  { name: 'councilTitleUpper', label: 'Council Title Upper' }, // default "Council", copy for the "Council", formal
  { name: 'complianceManagerAccessory', label: 'Compliance Manager Accessory' }, // default "a" or "the", copy for the "Compliance Manager"
];

const MAIN_COUNCIL_FIELDS = [
  { name: 'creatorName', label: 'Creator Name' },
  { name: 'creatorEmail', label: 'Creator Email' },
  { name: 'councilName', label: 'Council Name' },
  { name: 'orgName', label: 'Organization Name' },
  { name: 'chainName', label: 'Chain Name' },
  { name: 'councilMembersLink', label: 'Council Members Link' },
  { name: 'councilSafeLink', label: 'Council Safe Link' },
  { name: 'subscriptionInfo', label: 'Subscription Info' },
  // deploy transaction -- handle specifically for the deploy email(s)
  { name: 'deployTransactionLink', label: 'Deploy Transaction Link' },
];

export const INITIAL_INVITE = {
  label: 'Initial invitation to council members',
  messageId: 'invite_council_member',
  fields: MAIN_COUNCIL_FIELDS,
  cioId: 6,
  receivers: ['councilMembers'], // Could be sent to a single council member at a time -- manually via dashboard
};

export const INVITE_REMINDER = {
  label: 'Reminder to join a council for council member',
  messageId: 'reminder_to_join_council',
  fields: MAIN_COUNCIL_FIELDS,
  cioId: 7,
  receivers: ['councilMembers'], // Only sent to one council member at a time -- manually via dashboard
};

export const NOTIFY_COMPLIANCE_MANAGER_AFTER_DEPLOY = {
  label: 'Notify compliance manager after council is deployed',
  messageId: 'notify_compliance_manager_after_deploy',
  fields: concat(MAIN_COUNCIL_FIELDS),
  cioId: 8,
  receivers: ['councilComplianceManagers'],
  extraFields: ['councilMembers'],
};

export const COUNCIL_SETUP_COMPLETE = {
  label: 'Council setup is complete',
  messageId: 'council_setup_complete',
  fields: MAIN_COUNCIL_FIELDS,
  cioId: 9,
  receivers: ['creator'],
};

export const COUNCIL_DEPLOYED = {
  label: 'Council deployed',
  messageId: 'council_deployed',
  fields: MAIN_COUNCIL_FIELDS,
  cioId: 10,
  receivers: ['creator'],
};

export interface MailFormData {
  label: string;
  messageId: string;
  fields: { name: string; label: string }[];
  cioId: number;
  receivers?: string[];
}

export const MAIL_FORMS: MailFormData[] = [
  INITIAL_INVITE,
  INVITE_REMINDER,
  NOTIFY_COMPLIANCE_MANAGER_AFTER_DEPLOY,
  COUNCIL_SETUP_COMPLETE,
  COUNCIL_DEPLOYED,
];
