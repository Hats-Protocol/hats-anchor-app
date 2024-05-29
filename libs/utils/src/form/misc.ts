export const catchEnterKey = (
  e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
) => {
  e.key === 'Enter' && e.preventDefault();
};
