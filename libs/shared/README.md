# Shared Utilities

Shared utilities is a Node library of utilities shared between `app-utils` and `hats-utils`. Shared here to prevent circular dependencies across the libraries.

- `mapHatWithChainId` - mapping a hat (or any) object with chainId included as a property
- `createHierarchy` - determining the current hat's nearest siblings, parent and first child