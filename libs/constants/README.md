# App Constants

App constants is a Node library for storing default constant values for the app and libraries. It's specifically not contained in one of the other libraries so there's no circular dependencies between them.

- `chains` - Wagmi/RainbowKit chain data
- `contracts` - Contract ABIs [temp]
- `authorities` - Authority types
- `defaultHat` - Default Hat values
- `form` - Form values and empty field values
- `CONFIG` - Primary export from [`index.ts`](./src/index.ts) contains the major constants used across the app
- `ipfs` - Gateway values
- `landingContent` - Content for the [landing page/index](../../apps/frontend/pages/index.tsx)
- `misc` - Fallback `null` values
- `next-seo.config` - SEO metadata
- `subgraph` - Manage subgraph endpoints for the app
- `treeControls` - Controls for the Tree Page/OrgChart

