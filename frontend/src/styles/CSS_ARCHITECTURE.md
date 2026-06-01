# CSS Architecture

## Boundaries

- `ungdung.css`: global import hub only. It should import shared foundation/mobile utilities, not page or role UI.
- Page CSS lives with the owning page folder, for example `pages/quantrivien/admin-styles.css`, `pages/trangchu/trangchu-styles.css`, `pages/vieclam/vieclam-styles.css`, and `pages/congty/congty-styles.css`.
- Component CSS lives with the owning component, for example `components/dashboard-shell.css` and `components/header.css`.
- Dashboard shells and role workspaces use Tailwind utilities in their TSX files.
- Shared dashboard components must keep their responsive layout local to the component.
- Page-specific dashboard styles should be Tailwind utilities or scoped Tailwind arbitrary variants in the owning page.

## Rules

- Do not add new dashboard role styles to `ungdung.css`.
- Do not create new `dashboard-*.css` files for admin, employer, or candidate dashboards.
- Avoid inline `style` for layout, spacing, typography, colors, and component states.
- Inline `style` is allowed only for truly dynamic values such as computed percentages, uploaded image colors, or third-party embed sizing.
- Role hook classes such as `admin-*`, `ntd-*`, and `uv-*` are allowed only when they are styled by scoped Tailwind variants in the same TSX module.
