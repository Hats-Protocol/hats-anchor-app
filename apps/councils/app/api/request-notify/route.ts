import { PLACEHOLDERS } from '@hatsprotocol/config';
import { isEmpty, map, pick } from 'lodash';
import { formatAddress, logger } from 'utils';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
if (!INTERNAL_API_KEY) throw new Error('INTERNAL_API_KEY is not set');

const CUSTOMERIO_API_KEY = process.env.CUSTOMERIO_API_KEY;
if (!CUSTOMERIO_API_KEY) throw new Error('CUSTOMERIO_API_KEY is not set');

const ALERTS_HOST = process.env.ALERTS_HOST || 'http://localhost:8080';

interface NotificationInput {
  // required fields
  email: string;
  name: string;
  address: string;
  notificationId: string;
  // from: string;
  // other council fields
  ens?: string;
  orgName?: string;
  councilName?: string;
  chainName?: string;
  creatorName?: string;
  creatorEmail?: string;
  councilMembers?: { name: string; address: string }[];
  councilMembersLink?: string;
  councilSafeLink?: string;
  subscriptionInfo?: string;
  deployTransactionLink?: string;
  // copy
  complianceTitle?: string;
  memberTitle?: string;
  councilTitle?: string;
  councilTitleUpper?: string;
  memberName?: string;
  // relevant notification records
  councilId?: string;
  userId?: string;
}

const processNotifications = (notifications: NotificationInput[]) => {
  return map(notifications, (notification) => {
    const {
      email,
      name,
      address,
      notificationId,
      ens,
      // council details
      creatorName,
      creatorEmail,
      councilName,
      orgName,
      chainName,
      councilMembers,
      councilMembersLink,
      councilSafeLink,
      subscriptionInfo,
      deployTransactionLink,
      // copy
      complianceTitle,
      memberTitle,
      councilTitle,
      councilTitleUpper,
      memberName,
      // receiver info
      councilId,
      userId,
    } = pick(notification, [
      'email',
      'name',
      'address',
      'notificationId',
      'ens',
      // council details
      'creatorName',
      'creatorEmail',
      'councilName',
      'orgName',
      'chainName',
      'councilMembersLink',
      'councilMembers',
      'councilSafeLink',
      'subscriptionInfo',
      'deployTransactionLink',
      // copy for email
      'complianceTitle',
      'memberTitle',
      'councilTitle',
      'councilTitleUpper',
      'memberName',
      // database records
      'councilId',
      'userId',
    ]);
    const variables = {
      name: name || ens || formatAddress(address),
      address: formatAddress(address),
      // council details
      creatorName,
      creatorEmail,
      councilName,
      orgName,
      chainName,
      councilMembersLink,
      councilSafeLink,
      subscriptionInfo,
      deployTransactionLink,
      // copy
      complianceTitle: complianceTitle || PLACEHOLDERS.complianceTitle,
      memberTitle: memberTitle || PLACEHOLDERS.memberTitle,
      councilMembers: councilMembers || [],
      councilTitle: councilTitle || PLACEHOLDERS.councilTitle,
      councilTitleUpper: councilTitleUpper || PLACEHOLDERS.councilTitleUpper,
      memberName: memberName || PLACEHOLDERS.memberName,
    };

    return {
      email,
      notificationId,
      councilId,
      userId,
      variables,
    };
  });
};

const alertsUrl = `${ALERTS_HOST}/notify/request-email`;

export const POST = async (req: Request) => {
  const body = (await req.json()) as { notifications: NotificationInput[] };
  if (!body || isEmpty(body)) {
    return Response.json({ message: 'No notifications to send', success: false }, { status: 400 });
  }
  // TODO check headers for frontend config

  const notifications = processNotifications(body.notifications);

  return fetch(alertsUrl, {
    headers: { Authorization: 'Bearer 1324' },
    body: JSON.stringify(notifications),
    method: 'POST',
  })
    .then((result) => {
      logger.info('Email queued', { result });
      return Response.json({ message: 'Email queued', success: true }, { status: 200 });
    })
    .catch((err) => {
      logger.error('Email not queued', { err });
      return Response.json({ message: 'Email not queued', success: false }, { status: 500 });
    });
};
