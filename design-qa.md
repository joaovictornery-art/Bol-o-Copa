final result: blocked

# Design QA

Reference: revised Image Gen direction mixing the clean WhatsApp-style option with the barbecue matchday option.

Prototype URL: http://127.0.0.1:5173

Verified:
- Production build completes successfully with `npm.cmd run build`.
- The implemented UI uses the agreed constraints: R$ 5 entry fee and a 30 participant cap.
- The front end includes match summary, Pix copy block, score steppers, participant list, payment toggles, prize total, and organizer result simulation.

Blocked:
- In-app browser access to `http://127.0.0.1:5173` was blocked by enterprise network policy.
- Because the browser could not open localhost, I could not capture the prototype at the same mobile viewport or complete visual comparison against the reference image.

Follow-up QA needed:
- Open the local URL and check the 390px mobile layout.
- Confirm that long names, Pix key text, and participant rows do not clip.
- Submit a test participant, toggle payment status, and calculate winners.
