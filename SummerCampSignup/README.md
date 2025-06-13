# Summer Camp Registration Portal

A comprehensive web-based registration system for summer camp programs, featuring a modern React frontend with administrative tools and secure database management.

## Features

- **Easy Registration**: Streamlined multi-step registration form
- **Medical Information**: Comprehensive health and safety data collection
- **Draft Saving**: Save progress and complete registration later
- **E-Ticket Generation**: Automatic confirmation with unique ticket numbers
- **Admin Dashboard**: Real-time statistics and registration management
- **Email Communications**: Automated confirmation and reminder emails
- **CSV Export**: Download complete registration data
- **Secure Authentication**: Protected admin access

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI (shadcn/ui)
- **Email**: SendGrid integration

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SendGrid account (optional, for email features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd summer-camp-registration
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file with your configuration:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/camp_registration
   SESSION_SECRET=your-secure-session-secret
   SENDGRID_API_KEY=your-sendgrid-api-key
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Access the application at `http://localhost:5000`

## Configuration

### Admin Access
- Default admin credentials: username `admin`, password `admin123`
- **Important**: Change these credentials before production deployment

### Email Configuration
- The system works in demo mode without SendGrid
- Add `SENDGRID_API_KEY` to enable actual email sending
- Configure sender email address in `server/email.ts`

### Database Schema
The system automatically creates required tables including:
- Registration data with comprehensive medical information
- Session storage for secure admin authentication

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── email.ts            # Email functionality
│   └── adminAuth.ts        # Admin authentication
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Database schema definitions
└── package.json
```

## Key Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Update database schema
- `npm run db:studio` - Open database management interface

## Customization

### Branding
- Update colors in `client/src/index.css`
- Modify organization name in form components
- Replace logos and images in `attached_assets/`

### Form Fields
- Add/modify fields in `shared/schema.ts`
- Update form components in `client/src/components/`
- Run `npm run db:push` to apply schema changes

### Email Templates
- Customize email content in `server/email.ts`
- Update sender information and branding

## Deployment

### Production Checklist
1. Change default admin credentials
2. Set secure `SESSION_SECRET`
3. Configure production database
4. Enable HTTPS/SSL
5. Set up SendGrid for email delivery
6. Configure proper CORS settings

### Environment Variables
```env
# Required
DATABASE_URL=postgresql://...
SESSION_SECRET=secure-random-string

# Optional
SENDGRID_API_KEY=sg-...
NODE_ENV=production
```

## Security Features

- **HTTPS Enforcement**: Automatic redirect and security headers
- **Session Management**: Secure session storage with PostgreSQL
- **Input Validation**: Server-side validation with Zod schemas
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM
- **Admin Authentication**: Separate admin login system

## Legal Compliance

The system includes comprehensive terms and conditions covering:
- Registration policies and refund terms
- Medical information requirements
- Photo/video consent for promotional use
- Liability waivers and emergency medical authorization
- Pickup authorization and safety protocols

## Support & Maintenance

### Common Issues
- Database connection errors: Check `DATABASE_URL` format
- Email delivery issues: Verify SendGrid API key and sender verification
- Permission errors: Ensure admin credentials are correct

### Logging
- Server logs include request details and error information
- Frontend errors logged to browser console
- Email delivery status tracked in admin interface

## License

This project is provided as-is for educational and commercial use. Customize as needed for your organization.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This system was initially developed for Gokuldham Temple's summer camp program but has been generalized for broader use. Customize branding, terms, and functionality as needed for your organization.