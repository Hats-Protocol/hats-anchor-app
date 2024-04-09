/* eslint-disable import/prefer-default-export */

export const parseEventName = (eventName: string) => {
  if (eventName === 'HatImageURIChanged') return 'Hat Image Changed';
  const capitalLetters = eventName.match(/[A-Z]/g);
  if (!capitalLetters) return eventName;
  const indexes = capitalLetters.map((letter) => eventName.indexOf(letter));
  const split = eventName.split('');
  indexes.forEach((index, i) => {
    split.splice(index + i, 0, ' ');
  });
  return split.join('');
};
