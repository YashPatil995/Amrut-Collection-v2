# Task ID: 22 — Z.ai Code (orchestrator)

## Summary
Implemented all 14 requested changes for the Amrut Collection e-commerce platform. Auth system (Google login, OTP, NextAuth, auth-modal `startGoogle`) was NOT touched — only the storefront/admin UI and the data-isolation/cleanup logic described in the task.

## Files Modified
- `src/components/store/header.tsx` — Added Marathi name (अमृत / अमृत कलेक्शन) to logo on desktop & mobile; removed `hidden sm:block` so the brand text is always visible; updated announcement-bar phone to `+91 75077 32111` and pincode to `425111`; mobile-menu SheetTitle also shows the Marathi name.
- `src/components/store/footer.tsx` — Added `अमृत कलेक्शन` under the brand name; Instagram icon link now opens the real `https://www.instagram.com/amrut_dresses_parola?igsh=cWRwcGZ3eGZyZHU3`; phone/pincode/address updated; `tel:` and `wa.me` links use the new `+91 75077 32111`.
- `src/components/store/cart-views.tsx` — Phone/pincode placeholders (`7507732111`, `425111`), About view's "Visit Us" address & phone updated, About title now shows the Marathi name, Contact view's "Visit Our Store" + "Call Us" updated.
- `src/components/store/policy-views.tsx` — Privacy-policy contact body updated with new phone/pincode/address.
- `src/components/store/auth-modal.tsx` — Phone placeholder now `7507732111`.
- `src/components/store/account-modal.tsx` — Address-form phone/pincode placeholders updated.
- `src/components/store/home-view.tsx` — Removed the "Refer & Earn ₹200" PromoBanner card and replaced it with a "Festive Offers Inside" card (links to the sale section); Instagram feed now wraps each tile in `<a>` linking to the real Instagram URL and added a "Follow @amrut_dresses_parola" button; hero carousel overlay now shows `अमृत कलेक्शन` below the Amrut Collection chip; StoreMap contact info + iframe bbox/marker moved to `bbox=75.107,20.876,75.127,20.896&marker=20.886,75.117` (closer to "Main Bajar, front of Bhajipala Market, Parola, 425111"); removed unused `Gift` import.
- `src/components/store/shop-view.tsx` — Removed the entire "Minimum Rating" FilterGroup + `minRating` state + URL param + `activeFilterCount` contribution + interface fields; removed now-unused `Star`/`Check` imports.
- `src/components/store/product-detail-view.tsx` — "Size Guide" button now opens a `Dialog` showing a S/M/L/XL/XXL size chart with chest/waist/hip measurements (inches) + a note about bottom-wear waist sizing.
- `src/components/admin/product-form-dialog.tsx` — Added a "Waist Sizes (comma-separated)" field; waist sizes are merged into the main `sizes` array (so they appear as selectable sizes on the PDP) and also stored in `tags` as `waist:28,30,32` for filtering; added a "Search Keywords (comma-separated)" field that saves to `tags`; added an "Upload from Device" button that uses `FileReader.readAsDataURL` to add base64 image data URLs to the images list; added live image thumbnails with per-image remove buttons.
- `src/components/admin/security-panel.tsx` — Removed the entire "Change Password" dialog/section: `pwOpen`, `pwForm`, `showPw` state, the `PwField` and `PasswordStrength` components, the "Change Password" button, the password-dialog JSX, and the `changePassword` function. Removed now-unused imports (`ShieldAlert`, `Clock`, `KeyRound`, `Eye`, `EyeOff`, `RefreshCw`, `Lock`). Removed the "Strong password (8+ chars)" entry from the security checklist. Removed the "demo" comment in the 2FA verify handler and the "(demo)" suffix in the Export Log toast.
- `src/components/admin/reviews.tsx` — Approve/Reject/Delete now actually call the API (`PATCH /api/reviews` for status changes, `DELETE /api/reviews?id=…` for deletion). Added per-card busy state, status filter chips (All / Positive / Critical / Pending / Rejected), per-review status badges, a Refresh button, and a scrollable list (`max-h-[700px] overflow-y-auto scrollbar-thin`).
- `src/components/admin/categories-manager.tsx` — Edit dialog now has a "Category Name" field (in addition to image URL) so admin can rename a category; the card button label changed from "Change Image" to "Edit"; PATCH body now sends both `name` and `image`.
- `src/components/admin/marketing.tsx` — Removed "(demo)" from the coupon-created toast.
- `src/components/admin/settings.tsx` — Removed "Demo" from the Cards/Wallets toggle toasts.
- `src/lib/store.ts` — Added `view: s.view` to the `partialize` function so the current view (cart, product, etc.) persists in localStorage and survives page reload.
- `src/lib/useFetch.ts` — Added a `reload`/`mutate` function (bumps an internal nonce state) so callers can re-fetch after mutations; preserves the original behavior for `null` urls.
- `src/app/api/products/[slug]/route.ts` — DELETE handler now: (1) looks up the product by slug, (2) deletes related Review / WishlistItem / UserWishlist / OrderItem records first (defensive, in case the live DB doesn't yet have the new cascade), then (3) deletes the product. Returns 404 if the product doesn't exist.
- `src/app/api/reviews/route.ts` — Added a `PATCH` handler (`{ id, status }` → updates status to `approved`/`rejected`/`pending`, then recomputes the product's `rating`/`reviewCount`). Added a `DELETE` handler (`?id=xxx` → deletes the review, recomputes product stats). GET now supports an optional `status=pending|approved|rejected|all` query param so admins can see all reviews regardless of status.
- `prisma/schema.prisma` — `OrderItem.product` relation now uses `onDelete: Cascade` so deleting a product automatically deletes its order items (in addition to the existing cascade on Review and WishlistItem).
- `prisma/seed.ts` — Seeded products now have `discount: 0` and `sold: 0` (was previously calculated from mrp/price and from a demo sold count).

## Files Created
- `prisma/reset-sale.ts` — One-off script that ran `db.product.updateMany({ data: { discount: 0, sold: 0 } })` to zero out all 29 existing products' discount and sold fields. Run once via `bunx tsx prisma/reset-sale.ts`.

## Database
- `bunx prisma generate` + `bunx prisma db push` ran cleanly to apply the `OrderItem.product` cascade change. Prisma Client regenerated.
- `bunx tsx prisma/reset-sale.ts` reset 29 products: `discount=0, sold=0`.

## Endpoint smoke tests
- `POST /api/coupons { code:"AMRUT10", subtotal:2000 }` → 200, `{discount: 200}` ✅
- `GET /api/products?section=sale&limit=4` → 200, products returned ✅ (sale section works)
- `GET /api/products?discountOnly=true&limit=4` → 200 ✅ (discountOnly filter works — currently empty list since all discounts were reset to 0, which is correct behaviour)
- `DELETE /api/products/no-such-product` → 404 `{error:"Not found"}` ✅
- `PATCH /api/reviews { id:"fake-id", status:"approved" }` → 404 `{error:"Review not found"}` ✅
- `DELETE /api/reviews?id=fake-id` → 404 `{error:"Review not found"}` ✅
- `PATCH /api/reviews { id:real-id, status:"rejected" }` → 200, status updated to `rejected` ✅
- `PATCH /api/categories { id, name:"Boys Clothing" }` → 200, category renamed ✅

## Auth system — untouched
- `src/components/store/auth-modal.tsx` — `startGoogle` function and NextAuth form-POST flow NOT modified. Only the phone-number placeholder was updated.
- `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/config/route.ts`, `src/app/api/auth/debug/route.ts`, `src/app/api/otp/send/route.ts`, `src/app/api/otp/verify/route.ts` — NOT modified.

## Lint
`bun run lint` → **0 errors, 0 warnings**.

## Dev server
Read `/home/z/my-project/dev.log` — all storefront API routes return 200. No compilation errors. Hot-reload picked up every file change.
