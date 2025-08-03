# ChurchCMS - Church Management System

A comprehensive church management system built with React, TypeScript, and Supabase.

## Features

### 🏠 Dashboard
- Real-time statistics and analytics
- Upcoming events and birthdays
- Member growth tracking
- Financial summaries

### 👥 Member Management
- Complete member profiles with photos
- Membership status tracking
- Contact information management
- Role and ministry assignments

### 💰 Financial Management
- Donation tracking and receipts
- Income and expense management
- Financial goal setting
- Comprehensive reporting

### 📅 Event Management
- Event creation and scheduling
- Attendance tracking
- Event analytics and reporting
- RSVP management

### 💬 Communication
- Bulk messaging capabilities
- Announcement system
- Email and SMS notifications
- Communication history

### 📊 Reporting
- Member growth reports
- Financial summaries
- Event analytics
- Custom report generation

### 🙏 Ministry Features
- Prayer request management
- Small group organization
- Sermon library
- Volunteer coordination

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod validation
- **Routing**: React Router
- **State Management**: Zustand, TanStack Query

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd church-cms
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - The project is already configured with Supabase
   - Database migrations run automatically

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── events/         # Event management
│   ├── finance/        # Financial components
│   ├── members/        # Member management
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
├── lib/                # Utility functions
├── pages/              # Page components
└── contexts/           # React contexts
```

## Database Schema

The application uses Supabase with the following main tables:
- `members` - Member information and profiles
- `events` - Church events and activities
- `donations` - Financial contributions
- `attendance` - Event attendance tracking
- `communications` - Message history
- `prayer_requests` - Prayer request management
- `small_groups` - Small group organization

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f0332881-547d-45ff-b381-2ad6e6cd0af5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Deployment

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy using Lovable:
   - Open [Lovable](https://lovable.dev/projects/f0332881-547d-45ff-b381-2ad6e6cd0af5)
   - Click on Share -> Publish

3. Custom Domain:
   - Navigate to Project > Settings > Domains 
   - Click Connect Domain
   - [Read more about custom domains](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Features

- Authentication with Supabase Auth
- Role-based access control (Admin, Member roles)
- Row Level Security (RLS) enabled on all tables
- Secure file uploads to Supabase Storage
- Input validation on all forms

## Performance Optimizations

- Code splitting with React.lazy()
- Image optimization
- Efficient database queries with pagination
- Caching with TanStack Query
- Responsive design for all screen sizes

## Support

For support, please contact your church's technical team or create an issue in this repository.

---

Built with ❤️ for church communities worldwide.