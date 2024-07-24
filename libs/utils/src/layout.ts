export const getDisabledReason = ({
  action,
  isNotConnected,
  isOnWrongNetwork,
  isNotWearer,
  isClaimed = false,
  isCustom = false,
  publicFunction = false,
}: {
  action?: string;
  isNotConnected: boolean;
  isOnWrongNetwork: boolean;
  isNotWearer: boolean;
  isClaimed?: boolean;
  isCustom?: boolean;
  publicFunction?: boolean;
}) => {
  if (isNotConnected) {
    return 'You are not connected';
  }
  if (isOnWrongNetwork) {
    return 'You are on the wrong network';
  }
  if (isNotWearer && !publicFunction) {
    return 'You are not a wearer of the current hat';
  }
  if (isCustom) {
    return ''; // TODO is there a better message we can show for this?
  }
  if (isClaimed) {
    return 'You are already a signer';
  }
  return '';
};
