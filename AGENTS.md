# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

This is a monorepo for Hats Protocol applications built with Nx, Next.js, and TypeScript. The Hats Protocol is a smart contract system on Ethereum for managing roles and permissions through "hats" (NFTs representing roles).

**Key Applications:**

- **Anchor App** (`apps/frontend`): Main application at app.hatsprotocol.xyz for managing hats and trees
- **Claims App** (`apps/claims`): Application at claim.hatsprotocol.xyz for claiming hats
- **Councils App** (`apps/councils`): Application for council management

## Essential Commands

```bash
# Install dependencies
pnpm install

# Generate GraphQL client (REQUIRED before build)
pnpm generate

# ! each app has it's own namespace and uses the respective app-specific commands
# frontend/anchor is the default app namespace

# Development
pnpm dev                   # Start Anchor app (localhost:4200)
pnpm claims dev            # Start Claims app
pnpm councils dev          # Start Councils app

# Build
pnpm build                 # Build Anchor app
pnpm claims build          # Build Claims app
pnpm councils build        # Build Councils app

# Testing and Linting
pnpm test                  # Run tests across workspace
nx run claims lint         # Lint specific project
nx run councils test      # Test specific project

# Package management shortcuts
pnpm anchor <command>      # Run commands in frontend app
pnpm claims <command>      # Run commands in claims app
pnpm councils <command>    # Run commands in councils app
pnpm ui <command>          # Run commands in ui lib
```

Use build command for type checking.

## Architecture

### Nx Monorepo Structure

The codebase follows Nx architectural patterns with clear separation between apps and shared libraries:

**Apps** (`/apps/`):

- Each app is a complete Next.js application
- Apps consume shared libraries but don't export to other apps
- Each has its own routing, pages, and app-specific logic

**Libraries** (`/libs/`):

- **Atomic Design Pattern**: `ui` (atoms) → `molecules` → `organisms` → `pages`
- **Domain Libraries**: `hats-hooks`, `hats-utils`, `modules-ui`, `modules-hooks`
- **Infrastructure**: `constants`, `types`, `utils`, `contexts`, `forms`

### Key Library Responsibilities

- **`hats-hooks`**: React hooks for Hats Protocol interactions (blockchain queries, mutations)
- **`hats-utils`**: Pure utility functions for Hats data manipulation
- **`modules-ui`**: UI components specific to Hats Modules (extensions to the protocol)
- **`modules-hooks`**: Hooks for managing module state and interactions
- **`utils`**: General utilities including GraphQL mesh client, formatting, and app logic
- **`contexts`**: React context providers for global state management
- **`forms`**: React Hook Form components and form utilities
- **`ui`**: Base UI components (shadcn/ui based) consumed by all other libraries

### GraphQL Integration

The project uses GraphQL Zeus to generate a client for the Hats Mesh API:

- Generated client lives in `libs/utils/src/mesh`
- **Must run `pnpm generate` before building**
- The mesh API aggregates data from multiple subgraphs

### Styling & Components

- **Tailwind CSS** for styling with custom configuration
- **shadcn/ui** component library as foundation in `libs/ui`
- **Atomic Design**: Build up from ui atoms to molecules to organisms
- **Radix UI** primitives for accessibility

## Development Patterns

### Import Organization

- ESLint enforces simple-import-sort for consistent import ordering
- Barrel exports (`index.ts`) used throughout for clean imports

### Code Style

- Prefer camelCase for variables, kebab-case for files
- TypeScript strict mode enabled
- Keep files under 200 lines when possible
- JSDoc comments for complex functions
- Duplicate code once, refactor on third instance

### Module Boundaries

- Nx enforces module boundaries to prevent circular dependencies
- Libraries in `/libs/shared` help avoid circular imports
- Each library has a specific responsibility and dependency graph

### Web3 Integration

- Uses wagmi/viem for Ethereum interactions
- Chain configurations in `libs/constants/src/chains`
- Contract ABIs and addresses in `libs/constants/src/contracts`

## Environment Setup

Copy environment files and fill in required values:

```bash
cp .env.example .env.local
cp apps/frontend/.env.example apps/frontend/.env.local
```

Key environment variables:

- `HATS_MESH_API_URL`: GraphQL endpoint for Hats data
- Various RPC URLs for blockchain connections
- Analytics and service API keys
