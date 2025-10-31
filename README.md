# Garchen Archive Web UI

A Next.js web application for managing and cataloging Garchen Archive teaching materials.

## Features

- 📋 **Asset Management**: Browse, search, and manage archive assets (videos, audio, documents)
- ✏️ **CRUD Operations**: Create, read, update, and delete assets
- 🔍 **Advanced Search**: Filter by status, type, session, and more
- 📊 **Dashboard**: Overview of cataloging progress and statistics
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- 🚀 **Fast**: Server-side rendering with Next.js 14

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (shared with Go tools)
- **ORM**: Drizzle ORM
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (same as Go tools)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   cd web-ui
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your database connection string:
   ```env
   DATABASE_URL="postgresql://garchen_user:your_password@localhost:5432/garchen_archive"
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
web-ui/
├── app/                    # Next.js app router pages
│   ├── assets/            # Asset management pages
│   ├── sessions/          # Session management pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── db/               # Database schema and client
│   │   ├── schema.ts    # Drizzle schema (matches PostgreSQL)
│   │   └── client.ts    # Database connection
│   └── utils.ts          # Helper functions
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Database

This application uses the **same PostgreSQL database** as the Go tools. The schema is defined using Drizzle ORM in `lib/db/schema.ts` and mirrors the existing database structure.

### Inspecting the Database

```bash
npm run db:studio
```

This opens Drizzle Studio at `https://local.drizzle.studio` where you can view and edit data.

## Deployment to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Set root directory to `web-ui`

3. **Add environment variable**:
   - In Vercel project settings, add:
     ```
     DATABASE_URL=your_production_database_url
     ```

4. **Deploy**:
   - Vercel will automatically deploy on push to main branch

## Development Workflow

### Adding a New Page

1. Create a new directory in `app/`
2. Add a `page.tsx` file
3. The route is automatically created based on the folder structure

Example:
```tsx
// app/reports/page.tsx
export default function ReportsPage() {
  return <div>Reports Page</div>
}
```

### Adding a New UI Component

Use shadcn/ui CLI to add pre-built components:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
```

Or manually create components in `components/ui/`

### Database Queries

Use Drizzle ORM for type-safe database queries:

```tsx
import { db } from "@/lib/db/client";
import { archiveAssets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Select all assets
const assets = await db.select().from(archiveAssets);

// Find by ID
const asset = await db
  .select()
  .from(archiveAssets)
  .where(eq(archiveAssets.id, assetId))
  .limit(1);

// Insert
await db.insert(archiveAssets).values({
  name: "example.mp4",
  metadataSource: "gdrive",
  // ...
});

// Update
await db
  .update(archiveAssets)
  .set({ title: "New Title" })
  .where(eq(archiveAssets.id, assetId));

// Delete
await db
  .delete(archiveAssets)
  .where(eq(archiveAssets.id, assetId));
```

## Next Steps

- [ ] Add detail/edit pages for assets
- [ ] Implement search and filtering
- [ ] Add authentication (NextAuth.js)
- [ ] Create session management pages
- [ ] Add bulk operations
- [ ] Implement file uploads
- [ ] Add analytics dashboard

## Support

For issues or questions, please check the main project README or create an issue in the repository.
