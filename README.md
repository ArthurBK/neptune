This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Sanity on-demand revalidation

So that content changes in [Sanity Studio](https://neptune-psi.vercel.app/studio) appear immediately on the live site (e.g. [Interiors](https://neptune-psi.vercel.app/interiors)) instead of after the next ISR revalidate window:

1. **Vercel env**  
   In your Vercel project: **Settings → Environment Variables**. Add:
   - **Name:** `SANITY_REVALIDATE_SECRET`
   - **Value:** a long random string (e.g. from `openssl rand -hex 32`). Keep it secret.

2. **Sanity webhook**  
   In [sanity.io/manage](https://www.sanity.io/manage) → your project → **API** → **Webhooks** → **Create webhook**:
   - **URL:** `https://neptune-psi.vercel.app/api/revalidate` (or your production URL + `/api/revalidate`)
   - **HTTP method:** POST
   - **Secret:** the same value as `SANITY_REVALIDATE_SECRET`
   - **Trigger on:** Create, Update, Delete
   - **Projection:** `{ _type, "slug": slug.current, category }`  
     (so article revalidation knows which category/slug to invalidate)
   - **Status:** Enabled  

   Save. After the next publish in Studio, the revalidate API is called and the relevant pages refresh on the next request.

## Contributors in Sanity

The **Contributors** list contains both contributors and existing photographer
documents. Create new photographers as contributors and select them in an
article's **Photographer** field. Their profile includes photography and writing
credits.

The legacy `photographer` schema is retained for existing document IDs, references,
and profile URLs. It shares the contributor editing fields, but its creation
template and duplicate action are disabled. No content migration is required.
Run `node --test tests/contributors.test.cjs` to check profile and credit compatibility.

## Newsletter (Mailchimp)

The site newsletter form sends addresses to `POST /api/newsletter`, which saves
them in a Mailchimp audience using the [member upsert API](https://mailchimp.com/developer/marketing/api/lists/members/upsert-member).

Configure these **server-only** variables in `.env.local` and in the Vercel
environments where the form should work, then restart/redeploy:

- `MAILCHIMP_API_KEY`: a Mailchimp API key, including its data center suffix
  (for example `-us6`). Never use a `NEXT_PUBLIC_` prefix for this key.
- `MAILCHIMP_AUDIENCE_ID`: the ID of the audience that should receive signups.

New contacts are saved as `subscribed`. Repeated submissions use the same member
record; existing subscription statuses are preserved. Pending contacts are told
to check their inbox. Unsubscribed, cleaned, or transactional contacts receive an
error and must use Mailchimp's resubscription process; the endpoint does not
silently reactivate them. The form only requests an email, so other required
audience merge fields are skipped. Credentials and addresses are not logged.

Without configuration, the endpoint returns an error instead of a false success.
Run the isolated integration tests with `node --test tests/newsletter.test.cjs`.
They mock Mailchimp and do not add real contacts or send emails.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
