---
Task ID: 23
Agent: zai-code (Filter Manager + Dynamic Filters + Marathi Branding)

Task: 6 changes — Admin Filter Manager UI, sidebar entry, dynamic filters in shop-view, Marathi name styling (header/footer/hero), remove minRating, fix product-form checkboxes always visible.

Work Log:
- Read prior worklog (Task 22 was the last entry — 14 changes including brand name, sale reset, etc.). Inspected: api/filter-options/route.ts, admin-sidebar.tsx, admin-dashboard.tsx, shop-view.tsx, header.tsx, footer.tsx, home-view.tsx, product-form-dialog.tsx, prisma/seed-filters.ts, lib/useFetch.ts, lib/db.ts, ui/dialog.tsx, prisma/schema.prisma. Verified the FilterOption model exists, the seed-filters.ts has been run (DB has 144 filter options for color/size/waist/pattern × men/women/kids/all), and the existing filter-options API supports GET/POST/PATCH/DELETE.

1) Admin FilterManager (`src/components/admin/filter-manager.tsx`):
   - New `'use client'` named-export `FilterManager`.
   - UI: `Tabs` for type (Colors / Sizes / Waist / Patterns) + `Select` for gender (Men / Women / Kids / All). Each tab shows the type icon (Palette / Ruler / ScanLine / Shapes).
   - Add row: Input + "Add" button → POSTs to `/api/filter-options` with `{type, value, gender}`.
   - Options list: grid of "FilterChip" cards. Each chip has:
     • Editable value (click to rename inline → Input with Save/Cancel buttons)
     • Active toggle (green check button — toggles via PATCH `{id, active}`)
     • Delete button (red trash → opens AlertDialog confirm → DELETE)
   - Stats badges: active count, disabled count, total count.
   - Info banner explains per-gender scoping.
   - Auto-refreshes via `refreshKey` state after every mutation (add/rename/toggle/delete).
   - EmptyState shown when no options exist for the selected type+gender.

2) Admin sidebar + dashboard wiring:
   - `src/components/admin/admin-sidebar.tsx`:
     • Imported `SlidersHorizontal` from `lucide-react`.
     • Added `'filters'` to the `AdminTab` union type.
     • Added `{ id: 'filters', label: 'Filters', icon: SlidersHorizontal, hint: 'Colors, sizes & patterns' }` to `NAV_ITEMS` (placed between `patterns` and `orders`).
   - `src/components/admin/admin-dashboard.tsx`:
     • Imported `{ FilterManager } from './filter-manager'`.
     • Rendered `{active === 'filters' && <FilterManager />}` in the AnimatePresence block.

3) Dynamic filters in shop-view (`src/components/store/shop-view.tsx`):
   - Removed hardcoded `COLORS`, `SIZES`, `PATTERNS` arrays entirely.
   - Added 4 new `useFetch` calls (one per type) hitting `/api/filter-options?type={type}&gender={currentGender}`. The current gender defaults to `'all'` when no gender is selected (e.g. on the sale or new-arrivals page).
   - Each `FilterOption` is `{id, type, value, gender, active}`. The fetched options drive the FilterGroup rendering: each option becomes a clickable chip/checkbox labelled with `option.value`.
   - Added a new "Waist" FilterGroup section between Sizes and Patterns, populated from `/api/filter-options?type=waist`. Selected waist sizes are appended to the `size` query param in the products fetch (the existing `GET /api/products` already supports multi-value `size` filtering via `searchParams.getAll('size')`).
   - Added `selWaist` state + `setSelWaist` toggle. Filter selections reset automatically when the gender/section/category changes (so stale picks from another gender don't carry over).
   - FilterGroup sections are conditionally rendered only when their option list is non-empty (so the Waist section won't appear if no waist filters are seeded).
   - The `FilterProps` interface was extended with `colorOptions`, `sizeOptions`, `waistOptions`, `patternOptions`. `activeFilterCount` now includes `selWaist.length`.

4) Marathi name styling (bold/large/colorful, more prominent than English):
   - `src/components/store/header.tsx`:
     • Header logo block: Marathi "अमृत" (mobile) / "अमृत कलेक्शन" (desktop) is now the TOP line with `font-serif text-base font-bold gold-text drop-shadow-sm sm:text-lg` (gold gradient text). The English "Amrut" / "Amrut Collection" is now the subtitle below in `text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground`.
     • Mobile-menu SheetTitle: Same treatment — Marathi on top with `gold-text`, English subtitle below.
   - `src/components/store/footer.tsx`:
     • Footer brand block: bumped logo size to `h-12 w-12` + `text-xl`. Marathi "अमृत कलेक्शन" is now `font-serif text-2xl font-bold gold-text drop-shadow-sm`, English "AMRUT COLLECTION" is `text-[10px] font-semibold uppercase tracking-[0.25em] text-maroon`, and the tagline "Premium Indian Clothing" stays small underneath.
   - `src/components/store/home-view.tsx`:
     • Hero carousel overlay: the small "अमृत कलेक्शन" `text-xs` line is now a prominent `font-serif text-3xl font-bold gold-text drop-shadow-md sm:text-4xl` block sitting between the "Amrut Collection" gold chip and the banner title. The banner title was reduced from `text-4xl md:text-6xl` to `text-3xl md:text-5xl` so the Marathi name reads as the dominant brand line on the slide.

5) Removed `minRating` references completely:
   - `src/app/api/products/route.ts`: removed the `const minRating = searchParams.get('minRating')` line and the `if (minRating) where.rating = { gte: parseFloat(minRating) }` filter block.
   - `src/components/store/shop-view.tsx`: confirmed the rating filter UI and `minRating` state were already removed in Task 22. No remaining references anywhere in `src/`.

6) Product form dialog — checkboxes always visible:
   - `src/components/admin/product-form-dialog.tsx`: restructured the DialogContent layout:
     • `DialogContent` now uses `flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0` (no more whole-dialog scroll).
     • `DialogHeader` is `shrink-0` with a bottom border.
     • The `<form>` is `flex min-h-0 flex-1 flex-col`.
     • All the form fields are wrapped in a `flex-1 space-y-4 overflow-y-auto scrollbar-thin px-6 py-5` div — only this middle area scrolls.
     • A new `shrink-0 border-t border-border bg-muted/30 px-6 py-3` bottom bar always-visible contains: (a) the New/Trending/Bestseller/Featured checkboxes in a compact `grid grid-cols-2 gap-2 sm:grid-cols-4` and (b) the Cancel/Save `DialogFooter`.
   - Result: the checkboxes + action buttons are pinned at the bottom of the dialog and remain visible no matter how far the form fields scroll. The dialog itself stays within 90vh.

7) API tweak for admin (filter-options):
   - `src/app/api/filter-options/route.ts` GET: added an `all=true` query param. When `all=true`, the `active: true` filter is skipped so the admin FilterManager can see inactive options too. Behaviour for the public shop-view is unchanged (it doesn't pass `all`, so it still only gets active options). Gender scoping (`OR [{gender}, {gender:'all'}]`) is preserved.

Verification:
- Regenerated Prisma Client (`bunx prisma generate`) so the cached `db.filterOption` accessor was available. Pushed schema (`bunx prisma db push`) — DB already in sync. Restarted the dev server so the new Prisma Client took effect (the previously-cached `globalForPrisma.prisma` instance didn't know about the FilterOption model until the process restarted).
- `bun run lint` → 0 errors, 0 warnings.
- `bunx tsc --noEmit --skipLibCheck` → 0 errors in any of the files I touched (the only TS errors left are pre-existing in unrelated files: examples/websocket, skills/, api/auth/[...nextauth], api/banners, admin/customers).
- Smoke-tested the filter-options API via curl while the dev server was alive:
  • GET `/api/filter-options?type=color&gender=men` → 200, returns the color options for men+all genders.
  • GET `/api/filter-options?type=waist&gender=men&all=true` → 200, returns waist options for men+all genders.
  • POST `/api/filter-options {type:"color", value:"TestColorX", gender:"men"}` → 200, creates option, returns the new row.
  • PATCH `/api/filter-options {id, value:"RenamedColor", active:false}` → 200, renames + disables the option.
  • DELETE `/api/filter-options?id=...` → 200, deletes the option.
- Verified the shop-view fetches the four filter types (color/size/waist/pattern) when browsing `/shop?gender=men` — all four return 200 in dev.log.
- Auth system untouched: `src/components/store/auth-modal.tsx` `startGoogle`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/config/route.ts`, `src/app/api/auth/debug/route.ts`, `src/app/api/otp/send/route.ts`, `src/app/api/otp/verify/route.ts` were NOT modified.

Stage Summary:
- Admin can now manage all filter options (colors, sizes, waist sizes, patterns) per gender (men/women/kids/all) from a single FilterManager page accessible via the "Filters" nav item (icon: SlidersHorizontal). The page supports add / rename / enable-disable / delete with auto-refresh after every mutation.
- Shop view no longer has hardcoded filter lists. The filter sidebar now shows gender-specific colors, sizes, waist sizes, and patterns fetched live from `/api/filter-options`. A new "Waist" filter section appears for bottom-wear shoppers.
- Marathi brand name "अमृत कलेक्शन" is now the dominant brand line in the header (logo + mobile menu), footer, and hero carousel overlay — using a gold gradient text (`gold-text`), bold serif font, and larger size than the English subtitle. Mobile shows "अमृत"; desktop shows the full "अमृत कलेक्शन".
- `minRating` filter is fully gone from both the UI (Task 22) and the API (`src/app/api/products/route.ts`).
- Product form dialog: the New/Trending/Bestseller/Featured checkboxes + action buttons are pinned at the bottom of the dialog in a compact 4-column grid, always visible regardless of how far the form scrolls. The form fields live in a vertically scrollable area above.
- Files CREATED: `src/components/admin/filter-manager.tsx`, `agent-ctx/23-zai-code.md`.
- Files MODIFIED: `src/components/admin/admin-sidebar.tsx`, `src/components/admin/admin-dashboard.tsx`, `src/components/admin/product-form-dialog.tsx`, `src/components/store/shop-view.tsx`, `src/components/store/header.tsx`, `src/components/store/footer.tsx`, `src/components/store/home-view.tsx`, `src/app/api/filter-options/route.ts`, `src/app/api/products/route.ts`.
- Lint: 0 errors, 0 warnings. Dev server log shows filter-options endpoints returning 200; shop-view correctly fetches all four filter types per gender.
