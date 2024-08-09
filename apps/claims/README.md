# Hats Claims App

The Claims app is a Next.js app for handling standalone eligibility for [Hats](https://app.hatsprotocol.xyz) with supported eligibility modules.

## Start the app

To start the development server run `pnpm claims:dev` from the root of the project (not this directory). The server will be running on http://localhost:4200/. 

## Build production application

To test your local instance for a production build run `pnpm claims:build` from the root of the project (not this directory).

The build artifacts will be stored in the `{ROOT_DIR}/dist/apps` directory, ready to be deployed. Build cache for libraries is also stored in `{ROOT_DIR}/tmp/` so they don't need to rebuilt each time without changes.

## Development

