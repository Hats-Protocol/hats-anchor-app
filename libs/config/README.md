# App Config

App `config` is a Node library for storing default constant values for the app and libraries. It's specifically not contained in one of the other libraries so there's no circular dependencies between them.

> Be careful with adding environment-specific values here. This library is cached on build and will not reliably update with changes to the environment variables. If you need to use environment variables, handle within the app itself.

## Usage

```ts
// the library is imported as `@hatsprotocol/constants` since TS has some issue(s)
// with reusing the `constants` namespace. The tsconfig paths are setup for this alias.
import { CONFIG } from '@hatsprotocol/constants';
```

## Structure

**folders**

- `chains` - Wagmi & RainbowKit chain data
- `content` - Content for the landing page and around the app
- `contracts` - Contract ABIs
  - _to be removed when we can import from the sdks_

**files**

- `authorities` - Authority types
- `config` - Major constants used across the app
- `defaultHat` - Default Hat values
- `form` - Form values and empty field values
- `ipfs` - Gateway values
- `misc` - Fallback `null` values
- `next-seo.config` - SEO metadata
- `snapshotElections` - Snapshot election data for the claims app for hats with Election Modules
- `subgraph` - Manage subgraph endpoints for the app
- `treeControls` - Controls for the Tree Page/OrgChart
