import { pick } from 'lodash';

const ALERTS_TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ALERTS_TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const GET = async (request: Request) => {
  const body = await request.json();
  const message = pick(body, ['message']);

  try {
    const url = `https://api.telegram.org/bot${ALERTS_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${ALERTS_TELEGRAM_CHAT_ID}&text=${message}`;

    fetch(url);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return Response.json({ success: true });
};
