# Bowman Insurance - Frontend

Next.js frontend for the Bowman Insurance digital platform.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3
- **UI Components:** Radix UI (shadcn/ui)
- **State Management:**
  - TanStack Query (server state)
  - Zustand (client state)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Icons:** Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (marketplace)/      # Public marketplace pages
│   │   ├── (dashboard)/        # Customer dashboard
│   │   ├── (admin)/            # Admin panel
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components (Navbar, Footer)
│   │   ├── forms/              # Form components
│   │   └── shared/             # Shared components
│   ├── lib/
│   │   ├── api/                # API client and services
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Utility functions
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript types
├── public/                     # Static assets
└── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:3000`

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ENVIRONMENT=development
```

## Adding shadcn/ui Components

To add new UI components from shadcn/ui:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# etc.
```

## Project Features

### Authentication
- User registration
- Login/logout
- Password reset
- JWT token management
- Protected routes

### Insurance Marketplace
- Browse policies by category
- Filter and sort policies
- Policy comparison
- Shopping cart
- Checkout flow

### Customer Dashboard
- Policy management
- Payment history
- Claims filing
- Document management
- Profile settings

### Admin Panel
- User management
- Policy management
- Transaction monitoring
- Claims processing
- Analytics and reports

## Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run before committing:
```bash
npm run lint
npm run type-check
npm run format
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

Vercel will automatically:
- Build the application
- Deploy to global CDN
- Set up SSL certificate
- Enable preview deployments

### Other Platforms

Build the application:
```bash
npm run build
```

The output will be in the `.next` directory. You can deploy this to:
- AWS Amplify
- Netlify
- Cloudflare Pages
- Self-hosted with PM2

## Performance Optimization

- Image optimization with Next.js Image
- Code splitting with dynamic imports
- Route prefetching
- Static page generation where possible
- API response caching with TanStack Query

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
# Or use different port
npm run dev -- -p 3001
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript errors
```bash
# Check for type errors
npm run type-check
```

## Contributing

1. Create feature branch
2. Make changes
3. Run linting and tests
4. Format code
5. Submit pull request

## License

Proprietary - Bowman Insurance Agency
