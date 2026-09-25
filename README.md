# Spade9 VIP Barber Lounge

Mobile-first web app for the Spade9 members' lounge: public landing page, member dashboard, 4-step booking, My Stylist, My Hair Profile (Үсний Түүх), tiered rewards with a digital VIP card, and a CRM notification engine.

**Status: front-end prototype.** Every screen in the PRD works end to end, but data lives in `localStorage` via a mock store. There is no backend yet (see *Production gaps*).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # CRM, loyalty and availability logic
npm run build
```

Optional: copy `.env.example` to `.env` and set `VITE_GOOGLE_MAPS_API_KEY` to get the dark-styled live map. Without a key, the footer shows a static location card that links to Google Maps directions.

Demo login: any email and password signs in as the sample Platinum member (2,450 points).

## Map of the PRD

| PRD § | Where |
|---|---|
| 2 Landing: parallax hero, amenities, services, barber cards + tag-filtered lightbox, membership teaser, FAQ, map, hours | `src/pages/Landing.tsx`, `components/Lightbox.tsx`, `components/MapEmbed.tsx` |
| 3 Navigation: mobile bottom bar with haptics, desktop header that hides on scroll | `components/AppShell.tsx`, `components/useScrollHide.ts` |
| 4 Dashboard: "Сайн байна уу", countdown, radial tier progress, tier offers, persistent Цаг авах | `pages/Home.tsx` |
| 5 Booking (stylist → service → calendar → finalize, modify/cancel) and My Stylist (portfolio, next slot, Rebook My Usual) | `pages/Book.tsx`, `pages/MyStylist.tsx`, `lib/availability.ts` |
| 6 My Hair Profile: attributes, chemical logs with formula and hex, before/after slider, stylist notes | `pages/MyHair.tsx` |
| 7 Tiers and digital card with rotating QR | `lib/loyalty.ts`, `components/VipCard.tsx`, `pages/Rewards.tsx` |
| 8 CRM: 6-week color refresh, stylist VIP-slot alert, low-occupancy campaign (Black → Platinum) | `lib/crm.ts` |
| 9 Dark/gold tokens, lazy images, 300 ms ease-in-out, reduced-motion support | `src/styles.css`, `components/Photo.tsx` |

## Decisions the PRD left open (change in one place)

- **Tier thresholds**: Gold 0 / Platinum 2,000 / Black 5,000 points, earned at 1 point per $1 (`lib/loyalty.ts`).
- **VIP hours**: before 11:00 or from 18:00 (`pages/Book.tsx`, `lib/crm.ts`).
- **Dead-zone campaign**: windows below 30% occupancy. Black members are notified immediately, Platinum 2 hours later, and Gold is not notified (`lib/crm.ts`).
- **Photography**: every image slot renders a toned placeholder until you supply a real `src` in `data/mock.ts`.

## Production gaps (not built)

1. **Backend and auth.** Real accounts, a membership-application review queue, and a bookings database with server-side slot locking to prevent double booking.
2. **Real push notifications.** The app currently uses the in-page Notification API. Push when the app is closed needs a service worker, Web Push or FCM, and a scheduler to run `lib/crm.ts` server-side.
3. **Signed QR.** The check-in code must be a short-lived token signed by the server. The client-side payload is unsigned and only for the demo.
4. **Haptics on iOS.** Safari ignores the Vibration API. Haptics on iPhone need a native wrapper (e.g. Capacitor).
5. **Payments** for deposits and no-shows.
