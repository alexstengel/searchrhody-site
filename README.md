# SearchRhody

Standalone static site for SearchRhody, a local visibility service based in Johnston, Rhode Island.

The live site is https://searchrhody.com/. Do not push or publish changes without review and approval.

## Preview

```bash
python3 -m http.server 8854
```

Then open http://127.0.0.1:8854/

## Form backend

Inquiry submissions from `get-started.html` are posted to a Cloudflare Worker (`searchrhody-form`, source in `worker/worker.js`) which sends the owner notification and the customer confirmation through Resend, from getfound@searchrhody.com. Secrets (the Resend API key, and a Turnstile secret later) live only in Cloudflare Worker settings, never in this repo. There is no build step and no environment file in the site.

## Notes

- Packages are **Get Found** ($299 one-time) and **Stay Found** ($79/month, optional). Inquiry CTAs go to the Get Started form. A plain mailto:getfound@searchrhody.com remains in the footer as a fallback. There is no checkout.
- Brand coral is `#F1784B`. Atlantic is `#142C3E`, ivory `#F7F5EF`, sea glass `#69A9A1`.
- Screenshots in `screenshots/` are gitignored.
- The homepage is a static hero (phone-on-counter still), two package cards, and a comparison table. There is no scroll animation on the homepage.

## Archived proofs

`proof.html` (search-story) and `proof-before-after.html` (before-and-after) are local archived proofs. They are not linked from the homepage.
