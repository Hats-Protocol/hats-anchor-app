# App Hooks

App Hooks is a set of React hooks for managing specific interactions and UX in the app. They don't necessarily apply to generic Hat/Tree operations.

### General Hooks
- `useAgreementClaimsHatterContract` - `*DEPRECATED*` - handles claiming with Agreement Module v0
- `useAttemptAutoConnect` - attempts to connect to a wallet provider on page load
- `useCid` - calculates the `CID` of a JSON upload to IPFS
- `useClipboard` - extended `useClipboard` hook to include a default `Toast` notifications
- `useContractData` - fetches data from Etherscan's API about verified contracts
- `useDebounce` - debounce values from input fields to reduce spam on RPC endpoints
- `useDeepCompareEffect` - a `useEffect` that compares deep object values (`useOrgChartTree`)
- `useLocalStorage` - fetches/stores data in the user's local storage
- `useMediaStyles` - style wrapper for client check and shared media query styles
- `usePendHatterMint` - updates stored data for a tree to include a hat being minted to an existing Claims Hatter
- `usePinImageIpfs` - uploads an image to IPFS via [Pinata](https://pinata.cloud)
- `useProposalDetails` - fetches details about a specific proposal from Snapshot
- `useSafeDetails` - fetches details about a specific Safe from the Safe API
- `useSearchResults` - processes a search query and prepares the results for displaying in the [Command Palette](../../apps/frontend/components/CommandPalette.tsx)
- `useToast` - wrapper around Shadcn's default `useToast` hook. Leverages the custom [Toast](./src/components/Toast.tsx) component also.
- `useWaitForSubgraph` - waits for a subgraph to be indexed before attempting to refresh data

### Landing Data Hooks
- `useFeaturedTemplates` - fetches featured templates from the [Landing Content](../constants/src/content/landing.ts)
- `useFeaturedTrees` - fetches featured trees from the [Landing Content](../constants/src/content/landing.ts)
- `useFeaturedTreesData` - fetches data for featured trees from the `useFeaturedTrees` hook

### Hat Hooks
- `useHatGuildRoles` - filter Guild roles for a specific hat
- `useHatSnapshotRoles` - filter snapshot spaces and their potential roles for a given hat

### Tree Hooks
- `useImageURIs` - fetches `imageUrls` for a set of hats based on provided `imageUris`
- `useOrgChartTree` - combines data from other hooks into the needed output to display in the [OrgChart](../../apps/frontend/components/OrgChart/OrgChart.tsx) component
- `useTreeGuilds` - fetches Guild.xyz guilds for a specific tree (top hat details)
- `useTreeImages` - fetches images for a specific tree
- `useTreeSnapshotSpaces` - fetch [Snapshot](https://snapshot.org) spaces for a tree

## Special Extras

- [`Toast`](./src/components/Toast.tsx) - a custom toast component that can be used with the `useToast` hook
- `sha256.js` - a utility function to hash a string with SHA-256 (for cache keys of object data)