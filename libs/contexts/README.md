# Contexts

The `contexts` library is a set of React Contexts for the app. It's specifically not contained in one of the other libraries so there's no circular dependencies between them. Contexts are used to pass data through the component tree without having to pass props down manually at every level.

![Map of Anchor Contexts Nested]()


### Components

- `Modal` - the `<Modal />` component is extended here to make a universal modal component

### Contexts

- `EligibilityContext` - [Claims] context for the eligibility of a given hat
- `HatFormContext` - [Anchor] context for the individual hat form state
- `OverlayContext` - [Anchor] context for the overlay state (modals, toasts, tx history, etc.)
  - `StandaloneOverlayContext` - [Claims] context for standalone overlay state of the Claims or other standalone apps
- `SelectedHatContext` - [Anchor] context for the selected hat state
- `TreeFormContext` - [Anchor] context for the tree form state
