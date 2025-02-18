const INDENT_SPACING = 4;

/**
 * For a given maxDepth, return the padding needed to accommodate the depth
 *   higher max depth needs less padding to fit long names well
 * @param maxDepth - the highest depth in the tree
 * @returns padding in pixels
 */
export const paddingForMaxDepth = (maxDepth: number) => {
  if (maxDepth === 0) {
    return 0;
  }
  const maxPadding = 24;
  const minPadding = 2 * INDENT_SPACING;

  // ideally this was smarter, lol
  if (maxDepth >= 5) return minPadding;
  if (maxDepth < 5) return maxPadding;

  return minPadding;
};
