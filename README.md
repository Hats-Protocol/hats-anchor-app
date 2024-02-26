# Hats App Monorepo

<a alt="Hats Logo" href="https://app.hatsprotocol.xyz" target="_blank" rel="noreferrer">
    <img src="apps/frontend/public/icon.jpeg" width="200">
</a>

## Install the dependencies

To install the dependencies, use `pnpm install` in the root of the project.

## Start the app

To start the development server run `pnpm dev`. The server will be running on http://localhost:4200/.

## Build production application

To test your local instance for a production build run `pnpm build`.

The build artifacts will be stored in the `dist/` directory, ready to be deployed. Build cache for libraries is also stored in `tmp/` so they don't need to rebuilt each time without changes.

## Workspace Projects

#### Apps

- [`frontend`](./apps/frontend/) - the Hat's ["Anchor" app](#)
- [`election`](./apps/election/) - the Hat's ["Election" app](#)

#### Libs

- [`constants`](./libs/constants/) - holds shared constants for the app\*
- [`forms`](./libs/forms/) - shared form components and utilities †


- [`hats-hooks`](./libs/hats-hooks/) - hooks for interacting with the Hats Protocol contracts & subgraph
- [`hats-types`](./libs/hats-types/) - types extended beyond the subgraph and used in the app/libs
- [`hats-utils`](./libs/hats-utils/) - utilities for interacting with the Hats Protocol contracts
- [`hooks`](./libs/hooks/) - hooks pertinent to the UI state or UX of the app
- [`shared`](./libs/shared/) - shared app/hats utilities\*
- [`ui`](./libs/ui/) - shared UI components and styles
- [`utils`](./libs/utils/) - utilities for managing UI state and other app specific needs

\* avoids circular imports with other libraries
† coming soon

## Nx & Code integration

Have a look at the [Nx Console extensions](https://nx.dev/nx-console). It provides autocomplete support, a UI for exploring and running tasks & generators, and more! Available for VSCode, IntelliJ and comes with a LSP for Vim users.

