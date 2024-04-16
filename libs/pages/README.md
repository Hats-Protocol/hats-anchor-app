# Pages

The `pages` library contains all the pages that are used in the Hats project. The pages are built using Chakra UI components and are separate to reduce circular dependencies and improve code organization.

## Usage

To use the pages in your project, you can import the pages from the `pages` package and use them in your components.

```tsx
import { HomePage } from '@hats/pages';

const MyComponent = () => {
  return (
    <HomePage />
  );
};
```

## Available Pages

- `Claims` - a page that displays the eligibility and claimability of a Hat
- `HatDrawer` - a drawer that displays the details of a hat
- `ModuleDrawer` - a drawer that displays the details of a module
- `TreeDrawer` - a drawer that displays the details of a tree
- `TreePage` - a page that displays the details of a tree
    - `TreePageMobile` - a mobile version of the `TreePage`

## Modules

The `Claims` page pulls data about a hat and displays the appropriate module page for the given hat details.

- `AgreementModule` - the Agreement Eligibility Module
- `Election` - the Election Eligibility module
- `KnownModule` - a fallback module for all known modules\
