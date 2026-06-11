# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Bolão Decisions

- The first game is Brazil vs Morocco.
- Entry fee is R$ 5.
- There is no participant cap.
- Bets are public to the churrasco group, including each participant's score prediction.
- Bet submission does not require receipt upload.
- Participants send Pix receipts through WhatsApp outside the app.
- The organizer manually marks bets as paid/validated in the app.
- Optional goal scorer predictions add a scoring bonus.
- The app should support multiple pools/games, each with its own link, bets, payment status, and result.
- Firebase work must be cost-cautious: call out Blaze/billing risk, budget alerts not being hard caps, security rules, usage monitoring, and upload limits if uploads return later.
