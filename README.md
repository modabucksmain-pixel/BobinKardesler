# BobinKardesler

This project uses Supabase for authentication and content (announcements, giveaways, blog, etc.). Use the steps below to configure a fresh instance and ensure the admin announcement panel works.

## Local setup
1. Copy `.env.example` to `.env.local` and keep the provided Supabase URL and anon key (they already point to the new project). Add your YouTube API key/channel if you use the video widgets.
2. Install dependencies: `npm install`.
3. Start the app locally: `npm run dev`.

## Bootstrapping a new Supabase project
The repository already contains all migrations. To bring a new Supabase project up to date:

1. Open the Supabase SQL editor for the project at `https://knhawcenqscjmezortpr.supabase.co` (or use a `psql` connection with the service role key).
2. Paste and run the contents of [`supabase/new_instance_setup.sql`](./supabase/new_instance_setup.sql). This combines every migration (including the `announcements` table and its RLS policies) in the correct order.
3. Create an admin user from **Authentication → Users** in the Supabase dashboard and sign in through `/admin/login` in the app to manage announcements.

After the script runs and environment variables are set, creating announcements from the admin panel will insert rows into the `announcements` table, and published entries will display on the site once their `publish_at` time is reached.
