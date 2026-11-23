# SearchRhody story templates

These files are development templates only. They are not in the site navigation, are excluded from `sitemap.xml`, and should stay `noindex` until a real story is approved.

Do not treat the starter titles as published facts. They are editorial assignments.

## Templates

- `article.html` — a standard story
- `roundup.html` — a list of finds (starter assignment: a Rhode Island-made gift guide under $50)
- `maker-spotlight.html` — a profile that requires an interview and the maker’s permission
- `collection.html` — a group of related finds (not a store)

Each template includes a visible **DEV PLACEHOLDER** banner, placeholder dates and author, a hero-image slot with credit/alt, practical details, a disclosure slot, related-story placeholders, and the Buttondown newsletter form. Do not add Article or BlogPosting structured data until the story is verified.

## How to add a new article

1. Copy the right template to a public folder, for example `stories/your-slug.html`.
2. Replace the headline, dates, author, intro, body, and practical details with approved, verified copy only.
3. Add a licensed or original hero image, with credit and alt text. Do not use unlicensed photos or fabricated “local” imagery.
4. Fill in or remove the disclosure. Add affiliate or sponsored language only for approved relationships.
5. Remove the DEV PLACEHOLDER banner and the `noindex` robots tag.
6. Add Article or BlogPosting JSON-LD only for that verified story.
7. Link the story from the homepage featured cards, Discover (and Explore Rhody or Shop Rhody if it belongs there), and `sitemap.xml`.
8. Related-story links should point at other approved pieces, never at empty templates.

## How to add a newsletter issue

1. Once an email provider is chosen and connected, compose and send the issue there (confirmation and unsubscribe will come from that provider).
2. Optionally archive a public copy by copying `roundup.html` to something like `roundup/yyyy-mm-dd.html` and following the same approval steps as an article.
3. Replace the “sample issue coming soon” block on `newsletter.html` with a link to that archive when it exists.

The original service-site snapshot is tagged `service-site-v1` on `main`. Do not merge this 2.0 work until Alex approves it.
