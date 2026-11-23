# SearchRhody

Independent Rhode Island discovery guide and home of The Rhody Roundup newsletter.

The live site is still the earlier service website on `main`. This 2.0 publication rebuild lives on the `searchrhody-2` branch and must not be merged or deployed without explicit approval. The service-site snapshot is tagged `service-site-v1`.

## Preview

```bash
python3 -m http.server 8854
```

Then open http://127.0.0.1:8854/

There is no build step and no environment file. This is static HTML, CSS, and JavaScript, compatible with GitHub Pages. Keep the `CNAME` file when this is eventually deployed.

## Adding a story or a newsletter issue

See `templates/README.md`. Copy a template out of `templates/` (those files are not in the navigation), replace every placeholder with approved copy and imagery, then link the new page from Discover and `sitemap.xml`.

## Newsletter signup

The newsletter form is visible but not connected to a provider. Leave `NEWSLETTER_ENDPOINT` empty in `script.js` until a provider is chosen and tested. See `newsletter-providers.md` for the comparison and recommendation.

The existing Cloudflare Worker and Resend inquiry setup is intentionally untouched. Contact messages must not be added to a marketing list.

## Brand

Navy `#142C3E`, coral `#F1784B`, ivory `#F7F5EF`, sea glass `#69A9A1`. The header uses the existing pin plus a typographic SearchRhody wordmark so the old service tagline does not appear in the lockup. Original logo files remain in `brand/`.

## Notes

- Do not invent articles, subscriber counts, or stats.
- Do not add checkout, affiliate links, or an unapproved family photo.
- Do not change DNS, Cloudflare, or Resend from this branch.
- Development placeholders must be replaced before launch.
