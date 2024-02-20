# App Hooks

App Hooks is a set of React hooks for managing specific interactions and UX in the app. They don't necessarily apply to generic Hat/Tree operations.

- `useCid` - calculates the `CID`` of a JSON upload to IPFS
- `useContractData` - fetches data from Etherscan's API about verified contracts
- `useDebounce` - debounce values from input fields to reduce spam on RPC endpoints
- `useGuilds` - fetch [Guild](https://guild.xyz) spaces for the current tree
- `useImageURIs` - fetches `imageUrls` for a set of hats based on provided `imageUris`
- `useLocalStorage` - fetches/stores data in the user's local storage
- `useOrgChartTree` - combines data from other hooks into the needed output to display in the [OrgChart](../../apps/frontend/components/OrgChart/OrgChart.tsx) component
- `usePendHatterMint` - updates stored data for a tree to include a hat being minted to an existing Claims Hatter
- `usePinImageIpfs` - uploads an image to IPFS via [Pinata](https://pinata.cloud)
- `useSearchResults` - processes a search query and prepares the results for displaying in the [Command Palette](../../apps/frontend/components/CommandPalette.tsx)
- `useSnapshotSpaces` - fetch [Snapshot](https://snapshot.org) spaces for a tree
- `useToast` - wrapper around Chakra's default `useToast` hook. Leverages the custom [Toast](./src/components/Toast.tsx) component also.
