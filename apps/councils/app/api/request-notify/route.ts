import { PLACEHOLDERS } from '@hatsprotocol/config';
import { isEmpty, map, pick } from 'lodash';
import { CREATE_NOTIFICATION, formatAddress, getCouncilsGraphqlClient, logger } from 'utils';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
if (!INTERNAL_API_KEY) throw new Error('INTERNAL_API_KEY is not set');

const CUSTOMERIO_API_KEY = process.env.CUSTOMERIO_API_KEY;
if (!CUSTOMERIO_API_KEY) throw new Error('CUSTOMERIO_API_KEY is not set');

interface NotificationInput {
  email: string;
  name: string;
  address: string;
  notificationId: string;
  // from: string;
  ens?: string;
  orgName?: string;
  councilName?: string;
  chainName?: string;
  creatorName?: string;
  councilMembers?: { name: string; address: string }[];
  councilMembersLink?: string;
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
      creatorName,
      councilName,
      orgName,
      chainName,
      councilMembers,
      councilMembersLink,
      complianceTitle,
      memberTitle,
      councilTitle,
      councilTitleUpper,
      memberName,
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
      'councilName',
      'orgName',
      'chainName',
      'councilMembersLink',
      'councilMembers',
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
    const variables = JSON.stringify({
      name: name || ens || formatAddress(address),
      address: formatAddress(address),
      creatorName: creatorName,
      councilName: councilName,
      orgName: orgName,
      chainName: chainName,
      councilMembersLink: councilMembersLink,
      complianceTitle: complianceTitle || PLACEHOLDERS.complianceTitle,
      memberTitle: memberTitle || PLACEHOLDERS.memberTitle,
      councilMembers: councilMembers || [],
      councilTitle: councilTitle || PLACEHOLDERS.councilTitle,
      councilTitleUpper: councilTitleUpper || PLACEHOLDERS.councilTitleUpper,
      memberName: memberName || PLACEHOLDERS.memberName,
    });

    return {
      email,
      notificationId,
      councilId,
      userId,
      variables,
      sent: false,
      sentAt: null,
    };
  });
};

export const POST = async (req: Request) => {
  const body = (await req.json()) as { notifications: NotificationInput[] };
  if (!body || isEmpty(body)) {
    return Response.json({ message: 'No notifications to send', success: false }, { status: 400 });
  }
  // TODO check headers for frontend config

  const notifications = processNotifications(body.notifications);

  return getCouncilsGraphqlClient(INTERNAL_API_KEY)
    .request(CREATE_NOTIFICATION, {
      notifications: notifications,
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
