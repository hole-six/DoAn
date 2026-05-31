# CSS Architecture

## Boundaries

- `ungdung.css`: global tokens, public website layout, and temporary legacy overrides only.
- Dashboard shells and role workspaces use Tailwind utilities in their TSX files.
- Shared dashboard components must keep their responsive layout local to the component.
- Page-specific dashboard styles should be Tailwind utilities or scoped Tailwind arbitrary variants in the owning page.

## Rules

- Do not add new dashboard role styles to `ungdung.css`.
- Do not create new `dashboard-*.css` files for admin, employer, or candidate dashboards.
- Avoid inline `style` for layout, spacing, typography, colors, and component states.
- Inline `style` is allowed only for truly dynamic values such as computed percentages, uploaded image colors, or third-party embed sizing.
- Role hook classes such as `admin-*`, `ntd-*`, and `uv-*` are allowed only when they are styled by scoped Tailwind variants in the same TSX module.
