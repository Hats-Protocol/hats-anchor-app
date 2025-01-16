import { pick } from 'lodash';
import { logger } from 'utils';

const ALERTS_TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ALERTS_TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const POST = async (request: Request) => {
  const body = await request.json();
  const { message } = pick(body, ['message']);
  logger.debug('notify', body, message);

  const linkPreviewOptionsRaw = { is_disabled: true };
  const linkPreviewOptions = `link_preview_options=${JSON.stringify(linkPreviewOptionsRaw)}`;

  const baseUrl = `https://api.telegram.org/bot${ALERTS_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${ALERTS_TELEGRAM_CHAT_ID}`;

  const encodedMessage = encodeURIComponent(message);

  const url = `${baseUrl}&text=${encodedMessage}&${linkPreviewOptions}&parse_mode=MarkdownV2`;

  return fetch(url)
    .catch((error) => {
      logger.error('notify error', error);
      return Response.json({ error: error.message }, { status: 500 });
    })
    .then((response) => {
      logger.debug('notify response', response);
      return Response.json({ success: true });
    });
};
