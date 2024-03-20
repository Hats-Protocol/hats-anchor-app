/* eslint-disable import/prefer-default-export */
import { CONFIG } from '@hatsprotocol/constants';

/**
 * For a given maxDepth, return the padding needed to accommodate the depth
 *   higher max depth needs less padding to fit long names well
 * @param maxDepth the highest depth in the tree
 * @returns padding in pixels
 */
export const paddingForMaxDepth = (maxDepth: number) => {
  if (maxDepth === 0) {
    return 0;
  }
  const maxPadding = 24;
  const minPadding = 2 * CONFIG.CHAKRA_SPACING;
  // TODO handle override when only 1 hat on level 1 (handle at same as top hat and cascade the others)

  // ideally this was smarter, lol
  if (maxDepth > 4) return minPadding;
  if (maxDepth === 5) return 16;
  if (maxDepth < 6) return maxPadding;

  return minPadding;
};
