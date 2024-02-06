# Hats Claims App

The Anchor app is a Next.js app relying on the Core & Subgraph SDK as well as the other libraries contained here.

## Start the app

To start the development server run `pnpm dev` from the root of the project (not this directory). The server will be running on http://localhost:4200/. 

## Build production application

To test your local instance for a production build run `pnpm build` from the root of the project (not this directory).

The build artifacts will be stored in the `{ROOT_DIR}/dist/` directory, ready to be deployed. Build cache for libraries is also stored in `{ROOT_DIR}/tmp/` so they don't need to rebuilt each time without changes.
