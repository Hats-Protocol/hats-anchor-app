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

#### Libs
- [`app-constants`](./libs/app-constants/) - holds shared constants for the app*
- [`app-hooks`](./libs/app-hooks/) - hooks pertinent to the UI state or UX of the app
- [`app-utils`](./libs/app-utils/) - utilities for managing UI state and other app specific needs
- [`hats-hooks`](./libs/hats-hooks/) - hooks for interacting with the Hats Protocol contracts & subgraph
- [`hats-types`](./libs/hats-types/) - types extended beyond the subgraph and used in the app/libs
- [`hats-utils`](./libs/hats-utils/) - utilities for interacting with the Hats Protocol contracts
- [`shared-utils`](./libs/shared-utils/) - shared app/hats utilities*

*avoids circular imports with other libraries

## Nx & Code integration

Have a look at the [Nx Console extensions](https://nx.dev/nx-console). It provides autocomplete support, a UI for exploring and running tasks & generators, and more! Available for VSCode, IntelliJ and comes with a LSP for Vim users.

