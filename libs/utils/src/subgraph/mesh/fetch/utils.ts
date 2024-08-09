import { Hat } from "@hatsprotocol/sdk-v1-subgraph";
import { get } from "lodash";

export const parseMetadata = (hat: Hat) => {
  const detailsMetadata = get(hat, 'detailsMetadata');
  if (!detailsMetadata) return { ...hat, metadata: null, metadataType: null };
  return {
    ...hat,
    metadata: get(JSON.parse(detailsMetadata), 'data'),
    metadataType: get(JSON.parse(detailsMetadata), 'type'),
  };
};