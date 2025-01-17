import { logger } from '../logs';

export const sendTelegramMessage = async (message: string) => {
  const result = await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!result.ok) {
    throw new Error('Failed to send telegram message');
  }
  logger.debug('Telegram notification sent');

  return result;
};
