# Hats App Monorepo

<a alt="Hats Logo" href="https://app.hatsprotocol.xyz" target="_blank" rel="noreferrer">
    <img src="apps/frontend/public/icon.jpeg" width="200">
</a>

## Install the dependencies

To install the dependencies, use `pnpm install` in the root of the project.

## Get environment variables

To run the app, you need to have a `.env` file in the root of the project. You can copy the `.env.example` file and fill in the values.

```bash
cp .env.example .env.local
cp apps/frontend/.env.example apps/frontend/.env.local
# claims app doesn't have any additional variables yet
```

## Generate the Mesh API GraphQL client

The Mesh API GraphQL client is generated using [GraphQL Zeus](https://www.graphql-zeus.com/). **Your build might fail if you don't generate the client.**

```bash
pnpm generate # runs npx graphql-zeus $HATS_MESH_API_URL ./libs/utils/src/mesh
```

## Start the apps

To start the development server run `pnpm dev`. The server will be running on http://localhost:4200/.

```bash
pnpm dev # runs nx run frontend:dev (Anchor app)

pnpm councils:dev # runs nx run councils:dev (Councils app)

pnpm claims:dev # runs nx run claims:dev (Claims app)
```

## Build production application

To test your local instance for a production build run `pnpm build`.

The build artifacts will be stored in the `dist/` directory, ready to be deployed. Build cache for libraries is also stored in `tmp/` so they don't need to rebuilt each time without changes.

```bash
pnpm build # to build the Anchor app

pnpm claims:build # to build the Claims app
```

## Workspace Projects

#### Apps

- [`frontend`](./apps/frontend/) - the Hat's ["Anchor" app](https://app.hatsprotocol.xyz) for managing your hats and trees
- [`claims`](./apps/claims/) - the Hat's ["Claims" app](https://claim.hatsprotocol.xyz) for claiming all sorts of hats

#### Libs

- [`constants`](./libs/constants/) - holds shared constants for the apps
- [`contexts`](./libs/contexts/) - shared context providers for the apps
- [`forms`](./libs/forms/) - shared form components and utilities
- [`hats-hooks`](./libs/hats-hooks/) - hooks for interacting with the Hats Protocol contracts & subgraph
- [`hats-utils`](./libs/hats-utils/) - utilities for interacting with the Hats Protocol contracts
- [`hooks`](./libs/hooks/) - hooks pertinent to the UI state or UX of the apps
- [`icons`](./libs/icons/) - shared SVG icons
- [`modules-ui`](./libs/modules-ui/) - shared UI components for modules
- [`modules-hooks`](./libs/modules-hooks/) - shared hooks for module states
- [`molecules`](./libs/molecules/) - molecules are UI components that combine other atoms
- [`organisms`](./libs/organisms/) - organisms are larger UI components that contain molecules and atoms
- [`pages`](./libs/pages/) - shared page components
- [`shared`](./libs/shared/) - shared app/hats utilities\*
- [`types`](./libs/types/) - types extended beyond the subgraph and used in the apps/libs
- [`ui`](./libs/ui/) - shared UI components and styles
- [`utils`](./libs/utils/) - utilities for managing UI state and other app specific needs

\* avoids circular imports with other libraries  
<!-- † coming soon -->

## Nx & Code integration

Have a look at the [Nx Console extensions](https://nx.dev/nx-console). It provides autocomplete support, a UI for exploring and running tasks & generators, and more! Available for VSCode, IntelliJ and comes with a LSP for Vim users.
