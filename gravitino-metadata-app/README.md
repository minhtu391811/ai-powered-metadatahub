# Gravitino Metadata Management Platform

A modern web application for managing Apache Gravitino metadata with AI-powered assistance.

## Features

- **Authentication System**: Role-based access control with Admin, Editor, and Viewer roles
- **Metadata Dashboard**: Browse and manage catalogs, schemas, and tables
- **Access Control**: User and role management with granular permissions
- **AI Assistant**: Chatbot powered by AI SDK with Gravitino MCP server integration
- **Gravitino API Integration**: Full REST API client for Apache Gravitino

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **AI**: Vercel AI SDK v5 with tool calling
- **State Management**: SWR for data fetching and caching
- **Authentication**: Context-based auth (demo mode)

## Getting Started

### Prerequisites

- Node.js 18+ 
- Apache Gravitino instance running
- Gravitino MCP server running

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   NEXT_PUBLIC_GRAVITINO_API_URL=http://localhost:8090/api
   NEXT_PUBLIC_GRAVITINO_METALAKE=metalake_demo
   MCP_BASE_URL=http://localhost:8080
   \`\`\`
   
   **Important**: 
   - `NEXT_PUBLIC_GRAVITINO_API_URL` should include the `/api` path (e.g., `http://localhost:8090/api`)
   - For production, use HTTPS URLs (e.g., `https://gravitino.example.com/api`)

4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Demo Accounts

- **Admin**: admin@gravitino.com / admin123
- **Editor**: editor@gravitino.com / editor123
- **Viewer**: viewer@gravitino.com / viewer123

## Architecture

### Authentication
- Context-based authentication with localStorage persistence
- Protected routes with role-based access control
- Three user roles: admin, editor, viewer

### Gravitino Integration
- REST API client (`lib/gravitino-client.ts`)
- API routes for catalogs, schemas, and tables
- SWR hooks for data fetching and caching
- Direct connection to Gravitino REST API

### AI Assistant
- Powered by Vercel AI SDK v5
- Connected to Gravitino MCP server (no authentication required)
- 40+ tools for comprehensive metadata operations
- Real-time streaming responses with tool execution display

## API Routes

- `GET /api/gravitino/catalogs` - List all catalogs
- `POST /api/gravitino/catalogs` - Create a catalog
- `GET /api/gravitino/catalogs/[catalog]` - Get catalog details
- `GET /api/gravitino/catalogs/[catalog]/schemas` - List schemas
- `GET /api/gravitino/catalogs/[catalog]/schemas/[schema]/tables` - List tables
- `POST /api/chat` - AI assistant chat endpoint

## Project Structure

\`\`\`
app/
├── api/                    # API routes
│   ├── chat/              # AI chatbot endpoint with MCP tools
│   └── gravitino/         # Gravitino REST API routes
├── dashboard/             # Dashboard pages
│   ├── access-control/    # User and role management
│   ├── ai-assistant/      # AI chatbot interface
│   ├── schemas/           # Schema browser
│   └── tables/            # Table browser
├── login/                 # Login page
components/
├── dashboard-layout.tsx   # Main dashboard layout
├── protected-route.tsx    # Route protection HOC
└── ui/                    # shadcn/ui components
lib/
├── auth-context.tsx       # Authentication context
├── gravitino-client.ts    # Gravitino API client
└── hooks/
    └── use-gravitino.ts   # SWR hooks for Gravitino data
\`\`\`

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_GRAVITINO_API_URL` | Gravitino REST API URL (browser-accessible) | Yes | `http://localhost:8090/api` |
| `NEXT_PUBLIC_GRAVITINO_METALAKE` | Metalake name | Yes | `metalake_demo` |
| `MCP_BASE_URL` | Gravitino MCP server endpoint | Yes | `http://localhost:8080` |

**Important Notes:**
- Use `NEXT_PUBLIC_` prefix for variables accessed in the browser
- Include the `/api` path in `NEXT_PUBLIC_GRAVITINO_API_URL` (e.g., `http://localhost:8090/api`)
- `NEXT_PUBLIC_GRAVITINO_METALAKE` should be ONLY the metalake name (e.g., `metalake_demo`), NOT a URL
- For production, use HTTPS URLs

### Setting Environment Variables in v0

1. Click the **Settings (⚙️)** icon in the top right corner
2. Navigate to **Environment Variables**
3. Add the following variables:
   - **Name**: `NEXT_PUBLIC_GRAVITINO_API_URL`  
     **Value**: `http://localhost:8090/api`
   - **Name**: `NEXT_PUBLIC_GRAVITINO_METALAKE`  
     **Value**: `metalake_demo`
   - **Name**: `MCP_BASE_URL`  
     **Value**: `http://localhost:8080`
4. Click **Save** for each variable

**Common Mistakes to Avoid:**
- ❌ Setting `NEXT_PUBLIC_GRAVITINO_METALAKE` to `http://localhost:8090/api` (this is wrong!)
- ✅ Setting `NEXT_PUBLIC_GRAVITINO_METALAKE` to `metalake_demo` (this is correct!)
- ❌ Forgetting the `/api` suffix in `NEXT_PUBLIC_GRAVITINO_API_URL`
- ✅ Including `/api` in the URL: `http://localhost:8090/api`

## Troubleshooting

### "Failed to fetch" / CORS / Mixed Content Error

**Root Cause**: The v0 preview runs on HTTPS, but your Gravitino server runs on HTTP (localhost). Browsers block HTTP requests from HTTPS pages for security (called "Mixed Content" blocking). Additionally, CORS (Cross-Origin Resource Sharing) restrictions prevent requests between different origins.

**✅ Recommended Solution: Run the App Locally**

This is the simplest and most reliable solution:

1. **Download the project**:
   - Click the **⋮** menu in the top right
   - Select **Download ZIP**
   - Extract the files

2. **Install and run**:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

3. **Open in browser**: `http://localhost:3000`

4. **Why this works**: Both your Next.js app and Gravitino server are now on localhost, so there are no CORS or mixed content issues.

**Alternative Solution: Enable CORS on Gravitino**

If you want to keep using the v0 preview, configure your Gravitino server to allow cross-origin requests:

1. **Edit Gravitino configuration** (`gravitino.conf` or `application.properties`):
   \`\`\`properties
   # Allow all origins (development only)
   gravitino.server.webserver.allowedOrigins=*
   
   # Or allow specific origin (more secure)
   gravitino.server.webserver.allowedOrigins=https://v0.dev,https://v0.app
   \`\`\`

2. **Restart Gravitino server**

3. **Note**: This still won't solve the Mixed Content issue (HTTPS → HTTP). You would need to:
   - Run Gravitino with HTTPS/SSL, OR
   - Use a reverse proxy with SSL, OR
   - Use ngrok/cloudflare tunnel to expose Gravitino with HTTPS

**Alternative Solution: Use ngrok for HTTPS**

Expose your local Gravitino server with a public HTTPS URL:

\`\`\`bash
# Install ngrok: https://ngrok.com/download
ngrok http 8090

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update environment variable:
NEXT_PUBLIC_GRAVITINO_API_URL=https://abc123.ngrok.io/api
\`\`\`

### "Invalid request, only public URLs are supported"

This error occurs when trying to connect to localhost from the v0 preview environment. The v0 preview runs in a serverless environment that blocks connections to private/localhost addresses for security.

**Solution: Use Client-Side API Calls**

The app now makes API calls directly from your browser (client-side) instead of from the server. This allows your browser to access `http://localhost:8090` directly.

**Steps:**
1. Set `NEXT_PUBLIC_GRAVITINO_API_URL=http://localhost:8090/api` in Environment Variables
2. Set `NEXT_PUBLIC_GRAVITINO_METALAKE=metalake_demo`
3. Ensure your Gravitino server is running locally
4. The browser on your local machine will connect directly to localhost

**Alternative Solutions (if client-side doesn't work):**
1. **Use ngrok**: Expose your local Gravitino server with a public URL
   \`\`\`bash
   ngrok http 8090
   # Update NEXT_PUBLIC_GRAVITINO_API_URL with the ngrok URL
   \`\`\`

2. **Run the app locally**: Download and run on your machine
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

3. **Open in browser**: `http://localhost:3000`

4. **Why this works**: Both your Next.js app and Gravitino server are now on localhost, so there are no CORS or mixed content issues.

## License

MIT
