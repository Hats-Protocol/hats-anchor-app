# Hats Anchor App

The Anchor App is a Next.js app built for exploring the Hats Protocol. It provides a general interface to view Trees, Hats, and Wearers. Complex updates can be managed via the Tree Editor.

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Generate the Mesh API GraphQL client

```bash
pnpm generate
```

### Start the app

To start the development server run `pnpm dev` from the root of the project (not this directory). The server will be running on http://localhost:4200/.

```bash
pnpm dev
```

## Build production application

To test your local instance for a production build run `pnpm build` from the root of the project (not this directory).

```bash
pnpm build
```

The build artifacts will be stored in the `{ROOT_DIR}/dist/` directory, ready to be deployed. Build cache for libraries is also stored in `{ROOT_DIR}/tmp/` so they don't need to rebuilt each time without changes.

### Serve the production build

```bash
pnpm serve
```

## Deployment

Having multiple apps that are at different stages of deploy we can choose when to build based on changes in the specific app repo. If there's no changes in an app it won't be built by the CI/CD process. The simplest change is to add (or remove) an extra new line at the end of this file .

[//]: # 'DEPLOY_MARKER!!'
