# Shared Utilities

Shared utilities is a Node library of utilities shared between `utils` and `hats-utils`. Shared here to prevent circular dependencies across the libraries.

- `createHierarchy` - determining the current hat's nearest siblings, parent and first child
- `getDefaultAdminId` - getting the default admin ID for a given hat ID
- `mapHatWithChainId` - mapping a hat (or any) object with chainId included as a property

Keep to as minimal as possible to reduce inheritance confusion.
