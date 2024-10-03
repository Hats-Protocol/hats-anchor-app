# Shared Utilities

Shared utilities is a Node library of utilities shared between internal libraries. Shared here to prevent circular dependencies across the libraries.

- `createHierarchy` - determining the current hat's nearest siblings, parent and first child
    used in `contexts` and `utils`
- `mapHatWithChainId` - mapping a hat (or any) object with chainId included as a property
    used in `hats-hooks` and `utils`

Keep to as minimal as possible to reduce inheritance confusion.
