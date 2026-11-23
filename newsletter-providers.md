# Newsletter provider comparison

Researched on November 22, 2026, from each provider’s current official pricing or help pages. No accounts were created. Prices and limits change — confirm on the linked pages before signing up. SearchRhody now uses Buttondown. The comparison below was written before the account was created.

Sources:

- [Buttondown pricing](https://buttondown.com/pricing), [double opt-in](https://docs.buttondown.com/double-opt-in), [hosted and embedded forms](https://docs.buttondown.com/building-your-subscriber-base), [subscriber exports](https://docs.buttondown.com/data-exports-subscriber)
- [MailerLite pricing](https://www.mailerlite.com/pricing), [Free plan update (June 16, 2026)](https://www.mailerlite.com/help/free-plan-update-faq), [double opt-in](https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers), [email authentication](https://www.mailerlite.com/help/comply-with-new-email-authentication-policies), [reports](https://www.mailerlite.com/help/how-to-analyze-and-export-reports)
- [Kit pricing](https://kit.com/pricing), [Kit Free plan (updated September 23, 2026)](https://help.kit.com/en/articles/16627071-the-kit-free-plan), [double opt-in](https://help.kit.com/en/articles/2971364-the-all-important-double-opt-in), [export subscribers](https://help.kit.com/en/articles/2502489-how-to-export-subscribers-in-kit)

## Buttondown

- **Free / low-cost:** Free for the first 100 active subscribers, including a rich-text or Markdown editor, sending from a custom domain, and hosted archives. From 110–1,000 subscribers the published price is $9/month ($90/year). Add-ons on the free tier include analytics, tagging, and automations at extra monthly cost (analytics is +$9/month; automations +$29/month on the free list size). Prices assume at most one email a day to the full list.
- **Double opt-in:** Required by default. Subscribers stay unactivated until they confirm.
- **Forms:** Every newsletter has a hosted subscribe page (`buttondown.com/username`). You can embed a standard HTML form (good for this static site) or an iframe / web component. Extra standalone “Forms” pages are a paid Standard feature.
- **Export:** CSV export from the subscribers tab (email, dates, tags, metadata, and related fields), plus an exports API.
- **Automation / analytics:** Available, but they are add-ons at the smallest list sizes.
- **Custom-domain sending:** Included even on the free tier (“Send from a custom domain”). Archives on a custom domain are a separate add-on.

## MailerLite

- **Free / low-cost:** $0 for up to 250 active subscribers and 2,500 emails per month, with 2 seats, up to 3 forms, 3 automations, 1 landing page, and 1 website. Comfort paid plans start from $12/month ($10.80 billed yearly) on the pricing page. The Free plan was tightened on June 16, 2026 (subscribers down from 500 to 250; monthly emails down from 12,000 to 2,500).
- **Double opt-in:** Enabled by default on forms and can be turned off. Customizing the confirmation email requires a paid plan.
- **Forms:** Embedded forms, pop-ups, and a landing page are available on Free (active forms capped at 3). The MailerLite logo stays on the Free plan.
- **Export:** Subscriber and campaign data can be exported as CSV from campaign subscriber activity and from dashboard reports. Custom date-range reporting and custom report exports are paid features.
- **Automation / analytics:** 3 automations on Free, plus campaign reports. More flexible reporting is on Comfort/Power.
- **Custom-domain sending:** Domain authentication (SPF/DKIM and related DNS records) is documented as part of sending, including after the 14-day trial. “Custom domains” for MailerLite websites and landing pages are a paid (Comfort/Power) feature, not the same thing as authenticated sending.

## Kit (formerly ConvertKit)

- **Free / low-cost:** $0 for up to 10,000 confirmed subscribers, with unlimited forms, landing pages, and broadcasts, and no send cap. Creator paid plans add automations and sequences and, at the U.S. prices published for small lists, start at $39/month for up to 1,000 subscribers.
- **Double opt-in:** On by default (“Send confirmation email” checked). Unconfirmed signups do not count toward the 10,000.
- **Forms:** Unlimited forms and hosted landing pages on Free. “Built with Kit” branding stays on the Free plan.
- **Export:** CSV export from the subscribers list (email, name, status, tags, and related fields).
- **Automation / analytics:** Tagging and broadcast A/B tests are on Free. Visual automations, email sequences, rules, and RSS campaigns need a paid Creator plan.
- **Custom-domain sending:** You can verify a sending domain in Settings → Email on Free. A custom domain for removing Kit branding is a Creator feature; a custom click-tracking domain needs Pro. Free accounts are also enrolled in Kit’s Creator Network recommendation program, which can be turned off.

## Recommendation

**Choose Buttondown** for The Rhody Roundup, unless you already know you’ll need more than 100 subscribers in the first stretch or want built-in automations on day one.

It is the closest fit for a small, independent editorial newsletter on a static site: custom-domain sending is included on the free tier (so mail can come from a SearchRhody address once DNS is approved), double opt-in is required, a hosted page and an embeddable HTML form are available without a paid add-on, and you can export the list as CSV. The tradeoff is the 100-subscriber free cap and that analytics or automations cost extra until the list (or add-ons) grow. At 110 subscribers the $9/month tier includes several of those extras.

Pick **MailerLite** if you want a higher free cap (250), forms and a few automations included, and you don’t mind a broader marketing toolset or the MailerLite logo on the free plan.

Pick **Kit** if the 10,000-subscriber free cap matters more than anything else. It is generous for broadcasts and forms, and sending-domain verification is available, but welcome sequences need a paid plan, branding stays on Free, and the Creator Network is on by default.

Do not connect a provider to the live or preview form until you have approved one, created the account, and tested signup, confirmation, and unsubscribe.
