import { Hat } from "@hatsprotocol/sdk-v1-subgraph";
import { get } from "lodash";
import { AppHat } from "types";

export const parseMetadata = (hat: Hat): AppHat => {
  const detailsMetadata = get(hat, 'detailsMetadata');
  if (!detailsMetadata) return { ...hat, metadata: undefined, metadataType: undefined };
  return {
    ...hat,
    metadata: get(JSON.parse(detailsMetadata), 'data'),
    metadataType: get(JSON.parse(detailsMetadata), 'type'),
  };
};