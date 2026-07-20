# etgen — Frontend

Next.js 16 frontend for the Industrial Knowledge Intelligence Platform.

## Stack

- **Next.js 16** — React framework with App Router
- **React 19** — UI library
- **Tailwind CSS 4** — utility-first styling
- **Framer Motion** — animations
- **react-force-graph-2d** — knowledge graph visualization
- **Lucide React** — icon library

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

| Route          | Description                           |
|----------------|---------------------------------------|
| `/`            | Main dashboard with AI copilot chat   |
| `/assets`      | Asset management view                 |
| `/compliance`  | Compliance tracking                   |

## Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Dashboard page
│   │   ├── globals.css       # Global styles
│   │   ├── assets/           # Assets page
│   │   └── compliance/       # Compliance page
│   └── components/
│       ├── chat/             # AI copilot chat components
│       ├── graph/            # Knowledge graph visualization
│       └── layout/           # Layout components (sidebar, etc.)
├── public/                   # Static assets
├── package.json
├── tsconfig.json
└── Dockerfile
```
