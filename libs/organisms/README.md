# Hats Organisms

This initial component library is built with Shadcn and Tailwind.

## Component Groups

- `atoms` - basic building blocks
- `cards` - card components
- `forms` - form input components
- `molecules` - combinations of atoms
- `organisms` - combinations of molecules
- `themes` - theme components and styles

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
