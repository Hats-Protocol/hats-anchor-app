# Hat Forms

Hat Forms is a component library for all the forms in the Hats Apps. Leveraging the `form` atoms in the `ui` library and `react-hook-form`, this library provides a set of forms for creating, editing, and viewing hats.

## Forms

- `AuthoritiesListForm` - Form for editing authorities on a hat
  - `AuthoritiesFormItem` - Form Item for editing a single authority on a hat
- `ChainModuleForm` - Form for creating/editing a chain module
- `ClaimsHandler` - Form for handling claimability of a hat
- `DeactivateHatForm` - Form for deactivating many hats
- `HatBasicsForm` - Form for editing the basic information of a hat (name, description, mutability, etc.)
- `HatClaimForForm` - Form for claiming a hat (on behalf of another user)
- `HatLinkRequestApproveForm` - Form for approving a hat link request
- `HatLinkRequestCreateForm` - Form for creating a hat link request
- `HatControllersForm` - Form for managing the controllers of a Hat (eligibility, toggle) [prev. `HatManagementForm`]
- `HatRelinkForm` - Form for relinking a hat to a new parent
- `HatTransferForm` - Form for transferring a hat to a new owner
- `HatUnlinkForm` - Form for unlinking a hat from a parent
- `HatWearerForm` - Form for managing the wearers of a hat
- `HatWearerStatusForm` - Form for managing the status of a wearer on a hat
- `ImportTreeForm` - Form for importing a tree with edits and potentially draft hats
- `ResponsibilitiesForm` - Form for editing responsibilities on a hat
  - `ResponsibilitiesFormItem` - Form Item for editing a single responsibility on a hat

## Components

This library also contains pre-built components that leverage the theme styles with React Hook Form.

- [`AddressInput`]()
- [`DatePicker`]()
- [`DurationInput`]()
- [`DynamicThresholdInput`]()
- [`FormRowWrapper`]()
- [`Input`]()
- [`LabelWithLink`]()
- [`LinkInput`]()
- [`MarkdownEditor`]()
- [`MultiHatsSelect`]()
- [`MultiAddressInput`]()
- [`NumberInput`]()
- [`PlatformInput`]()
- [`RadioBox`]()
- [`RadioCard`]()
- [`RequirementBox`]()
- [`Select`]()
- [`Textarea`]()

### Module Args Components

These components are used to build generic form components for corresponding module args.

- [`AddressInput`]()
- [`AmountWithDecimals`]()
- [`BooleanInput`]()
- [`HatInput`]()
- [`ModuleFormInput`]()

