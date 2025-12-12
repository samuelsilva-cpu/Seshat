# Block A: Core App Implementation

This directory contains the complete implementation of Block A of the Plane app, featuring:

- **Projects**: Create, read, update, and manage projects
- **Issues**: Full issue management with status and priority
- **Board**: Kanban-style board with drag-and-drop
- **Comments**: Real-time comments on issues
- **Labels**: Create and assign labels to issues
- **Activity Log**: Audit trail of all changes

## Architecture

### Folder Structure

```
app/
├── components/
│   ├── layout/              # App layout components
│   │   ├── AppLayout.tsx    # Main app container
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── Topbar.tsx       # Top header bar
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Tag.tsx
│       ├── Avatar.tsx
│       ├── Modal.tsx
│       ├── BlurSurface.tsx
│       └── Tab.tsx
├── db/
│   ├── schema.ts            # Database tables (Drizzle ORM)
│   ├── client.ts            # Database client
│   └── migrations.ts        # Migration utilities
├── models/
│   ├── project.server.ts    # Project CRUD
│   ├── issue.server.ts      # Issue CRUD
│   ├── comment.server.ts    # Comment CRUD
│   └── label.server.ts      # Label CRUD
├── routes/
│   ├── app._index.tsx       # Dashboard
│   ├── app.projects._index.tsx       # Projects list
│   ├── app.projects.$projectId.tsx   # Project detail
│   ├── app.issues._index.tsx         # Issues list
│   ├── app.issues.$issueId.tsx       # Issue detail
│   └── app.board._index.tsx          # Kanban board
├── hooks/
│   ├── useOfflineState.ts   # [Block B] Offline state
│   └── useCRDT.ts           # [Block B] CRDT sync
├── styles/
│   └── app.css              # App-specific styles
└── BLOCK_B_PLAN.md         # Block B architecture plan
```

## Getting Started

### Prerequisites

- Node.js >= 22.18.0
- pnpm >= 10.24.0
- PostgreSQL database (or use local development instance)

### Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure database**:
   ```bash
   # Copy environment template
   cp app/.env.example .env

   # Update DATABASE_URL with your PostgreSQL connection
   ```

3. **Initialize database schema**:
   ```bash
   # Use Drizzle Kit to push schema
   pnpm exec drizzle-kit push:pg
   ```

4. **Run development server**:
   ```bash
   pnpm dev
   ```

5. **Access the app**:
   - Navigate to `http://localhost:3000/app`
   - Dashboard at `/app`
   - Projects at `/app/projects`
   - Issues at `/app/issues`
   - Board at `/app/board`

## Component Library

### UI Components

All UI components are built with Tailwind CSS and follow Apple/Linear design patterns:

#### Button
```tsx
import { Button } from "@/app/components/ui";

<Button variant="primary" size="md" onClick={onClick}>
  Click me
</Button>
```

**Variants**: `primary`, `secondary`, `ghost`, `danger`
**Sizes**: `sm`, `md`, `lg`
**Props**: `loading`, `icon`, `fullWidth`, `disabled`

#### Input
```tsx
import { Input } from "@/app/components/ui";

<Input
  label="Project Name"
  placeholder="Enter name"
  error={error}
  helperText="Used in URLs"
/>
```

#### Card
```tsx
import { Card } from "@/app/components/ui";

<Card variant="glass" padding="lg" interactive>
  Content goes here
</Card>
```

**Variants**: `default`, `glass`, `bordered`
**Padding**: `none`, `sm`, `md`, `lg`

#### Avatar
```tsx
import { Avatar } from "@/app/components/ui";

<Avatar src={imageUrl} alt="User" size="md" />
```

#### Tag
```tsx
import { Tag } from "@/app/components/ui";

<Tag color="#3B82F6" variant="default">
  Bug
</Tag>
```

#### Modal
```tsx
import { Modal } from "@/app/components/ui";

<Modal isOpen={isOpen} onClose={onClose} title="Create">
  Content
</Modal>
```

#### BlurSurface
```tsx
import { BlurSurface } from "@/app/components/ui";

<BlurSurface variant="light" rounded="xl">
  Glassmorphic content
</BlurSurface>
```

### Layout Components

#### AppLayout
Main app container with sidebar and topbar:
```tsx
import { AppLayout } from "@/app/components/layout";

<AppLayout
  activeRoute="projects"
  topbarTitle="Projects"
  topbarSubtitle="All projects"
  topbarActions={<Button>+ New</Button>}
>
  Page content
</AppLayout>
```

## Database

### Schema

The database uses Drizzle ORM with PostgreSQL and includes:

- **projects**: Core project data
- **issues**: Issues with status, priority, assignee
- **comments**: Issue comments with author info
- **labels**: Project labels with colors
- **issue_label_mapping**: Many-to-many relationship
- **activity_log**: Audit trail of all changes

### Models

Server-side models provide CRUD operations:

```typescript
import { createProject, getProjectById, updateProject } from "@/app/models/project.server";
import { createIssue, getProjectIssues, updateIssue } from "@/app/models/issue.server";
import { createComment, getIssueComments } from "@/app/models/comment.server";
import { createLabel, getProjectLabels, addLabelToIssue } from "@/app/models/label.server";
```

### Activity Logging

All changes are logged automatically:

```typescript
// Example: Creating a project logs the activity
const project = await createProject(
  "My Project",
  "my-project",
  "user-123"
);
// Automatically creates activity log entry
```

## Routes

### Dashboard
**Path**: `/app`
- Overview stats
- Quick actions
- Recent activity

### Projects
**Path**: `/app/projects`
- List all projects
- Create new project
- View project details

**Detail Path**: `/app/projects/:projectId`
- Project overview
- Issues list
- Labels
- Activity log

### Issues
**Path**: `/app/issues`
- Filter by status
- Filter by priority
- Search issues

**Detail Path**: `/app/issues/:issueId`
- Issue description
- Comments section
- Status selector
- Priority selector
- Labels
- Activity log

### Board (Kanban)
**Path**: `/app/board`
- Three columns: Todo, In Progress, Done
- Drag-and-drop issues
- Real-time status updates

## Styling

### Design System

The app uses a custom design system with:
- **Colors**: Blue (#3B82F6), Slate grays, semantic reds/greens
- **Spacing**: 4px base unit
- **Rounded corners**: XL default (rounded-xl)
- **Shadows**: Minimal, glassmorphic effects
- **Typography**: San-serif, clear hierarchy

### Dark Mode

All components support dark mode via Tailwind's `dark:` prefix. Theme is managed at the root level.

### Custom Styles

App-specific styles are in `styles/app.css`:
- Glass effect utilities
- Animations (fadeIn, slideInUp)
- Text utilities (line-clamp)
- Custom scrollbars

## API Integration

### REST Endpoints

The server provides REST endpoints for:

```
GET    /api/projects              # List projects
POST   /api/projects              # Create project
GET    /api/projects/:id          # Get project
PUT    /api/projects/:id          # Update project

GET    /api/projects/:id/issues   # List issues
POST   /api/projects/:id/issues   # Create issue
GET    /api/issues/:id            # Get issue
PUT    /api/issues/:id            # Update issue

GET    /api/issues/:id/comments   # List comments
POST   /api/issues/:id/comments   # Create comment
PUT    /api/comments/:id          # Update comment

GET    /api/projects/:id/labels   # List labels
POST   /api/projects/:id/labels   # Create label
```

## Testing

### Unit Tests
```bash
pnpm test:unit
```

### Integration Tests
```bash
pnpm test:integration
```

### E2E Tests
```bash
pnpm test:e2e
```

## Performance

### Optimization Techniques

1. **Code Splitting**: Routes are lazy-loaded
2. **Image Optimization**: Using modern formats (WebP)
3. **Component Memoization**: Prevent unnecessary re-renders
4. **Query Optimization**: Efficient database queries with indexes

### Metrics

- **FCP**: < 1.5s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **TTI**: < 3.5s

## Accessibility

All components follow WCAG 2.1 AA standards:
- Keyboard navigation
- Screen reader support
- Semantic HTML
- Color contrast ratios

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Next Steps: Block B

Block A provides the foundation. Block B (Offline + CRDT) will add:

- **Offline-first**: Full functionality without internet
- **CRDT Sync**: Conflict-free multi-user collaboration
- **IndexedDB**: Local data persistence
- **Real-time Updates**: WebSocket synchronization

See `BLOCK_B_PLAN.md` for detailed architecture and implementation plan.

## Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL format
# postgresql://user:password@host:port/dbname?sslmode=require

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Port Already in Use
```bash
# Change port in package.json
"dev": "react-router dev --port 3001"
```

### Schema Mismatch
```bash
# Regenerate schema
rm -rf drizzle/
pnpm exec drizzle-kit generate:pg
pnpm exec drizzle-kit push:pg
```

## Contributing

When adding features:
1. Follow existing component patterns
2. Add TypeScript types
3. Update activity log
4. Write tests
5. Update documentation

## License

AGPL-3.0 - See repository root for details
