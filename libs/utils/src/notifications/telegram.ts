import { logger } from '../logs';
import { chainsMap } from '../web3/chains-server';

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

// Sanitize message for Telegram API
export const sanitizeMessage = (message: string | null | undefined) => {
  if (!message) return undefined;
  return message.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
};

export const tgFormatAddress = (address: string) => {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

export const tgChainSlug = (chainId: number) => {
  return chainsMap(chainId).name.toLowerCase().replaceAll(' ', '-');
};
