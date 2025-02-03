import { logger } from '../logs';

/**
 * Send a message to the Telegram Alerts channel
 * @param message - The message to send
 * @returns The response from the Telegram API
 */
export const sendTelegramMessage = async (message: string) => {
  // TODO better sanitation on the message, catch invalid characters (period, et al)
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

export const sanitizeMessage = (message: string | null | undefined) => {
  if (!message) return undefined;
  return message.replaceAll('.', '\\.');
};
