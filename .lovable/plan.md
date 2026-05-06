## What we'll build

Skip email verification for now. Adding a roommate just stores their name + email + an avatar locally (in the household DB) and they immediately appear as a tappable card. Tapping a card opens a dedicated profile screen with their photo, trips, expenses, and who-owes-whom.

### 1. DB additions (one migration)

New table `roommate_profiles` (lightweight, non-auth roommates so a real account isn't required):
- `id`, `group_id`, `created_by`, `name`, `email` (nullable), `avatar_url` (nullable, emoji or uploaded), `color` (for avatar bg), `created_at`
- RLS: group members can SELECT / INSERT / UPDATE / DELETE rows for their group (using `is_group_member`).

Extend `money_requests` with two nullable columns so we can attribute splits to a non-auth roommate too:
- `roommate_profile_id uuid` (nullable) — the "other party" when they're not a real user
- `split_with jsonb` default `'[]'` — array of `{name, share}` for multi-way splits
- `category text` default `'general'` (rent / water / food / trip / other)

Storage bucket `roommate-avatars` (public read, authed write) for uploading roommate photos.

### 2. New roommate flow on dashboard

Replace the current "Add roommate" dialog action with a simpler **Add roommate** form:
- Name (required), email (optional, no verification), pick an avatar (emoji preset or upload photo)
- On submit → insert into `roommate_profiles` → toast → roommate card appears

Roommate row on dashboard becomes a horizontal scroll of avatar cards. Tapping a card navigates to `/app/roommate/:id`.

### 3. New screen: `src/pages/app/RoommateProfile.tsx` (`/app/roommate/:id`)

Top: large avatar/photo, name, email, edit (rename / change photo / delete).

Sections:
- **Quick split** — form: trip/category name, total amount, date, who paid (you or them), split type (equal / custom shares) → creates a `money_requests` row tied to that roommate
- **Trips & shared spends** — list of `money_requests` for this roommate, grouped by `trip_date`, showing items, who paid, amount, status. Each row shows the resulting balance line ("You owe ₹X" / "They owe ₹X")
- **Running balance card** at the top of the list — sum of sends minus requests
- **Categories tracked**: rent, water bill, electricity, food, groceries, internet, gas, trips, misc (chips to filter)

Uses existing `AppLayout` so the mobile shell + back button work.

### 4. Dashboard landing page upgrades

- Add a hero illustration/photo at the top (use a friendly roommates illustration via Unsplash URL — no upload needed)
- Add a **What you can track** grid with icons + short copy:
  - Rent split, Electricity, Water, Wi-Fi, Groceries, Cooking gas, Trips, Subscriptions, Cleaning rota, Monthly summary
- Add a **This month at a glance** mini-stat strip (total spent, you owe, owed to you, top category)
- Roommates strip becomes scrollable avatar cards (tap → profile) with a `+` card at the end

### 5. Routing

Add `/app/roommate/:id` route in `src/App.tsx` wrapping `RoommateProfile` in `RequireAuth` + `AppLayout`.

### Files

- new: `supabase/migrations/<ts>_roommate_profiles.sql`
- new: `src/pages/app/RoommateProfile.tsx`
- edit: `src/components/app/RoommateSection.tsx` — new add form (name/email/avatar), avatar scroller, link to profile
- edit: `src/pages/app/Dashboard.tsx` — hero image, feature grid, stat strip
- edit: `src/App.tsx` — add roommate profile route

### Notes

- No email is sent — verification fully skipped per your instruction.
- All amounts stay in ₹ INR.
- We keep existing `invitations` flow untouched; the new roommate-profile path is the default for now.
