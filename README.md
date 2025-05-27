# Veterans Claims Assistance Portal

A secure web application for veterans to submit VA claim assistance requests, with an admin-only interface to view and manage submissions.

## Features

- **Public-facing submission form** for veterans to request assistance with VA claims
- **Secure admin login** to access and manage submitted requests
- **Admin dashboard** to view, filter, and update the status of claim requests
- **Responsive design** that works on desktop and mobile devices
- **File attachment support** for military medical records and VA claim letters
- **End-to-end encryption** for sensitive veteran data

## Technology Stack

- **Frontend**: HTML, JavaScript, and Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for file uploads
- **Security**: CryptoJS for client-side encryption

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (included with Node.js)
- A Supabase account (free tier is sufficient)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vets-claims-easy.git
   cd vets-claims-easy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project at https://supabase.com

4. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ENCRYPTION_KEY=your_secure_encryption_key
   ```

5. Run the database migration:
   ```bash
   npm run migrate
   ```

6. Start the development server:
   ```bash
   npm start
   ```

7. Open http://localhost:3000 in your browser

### Supabase Setup Instructions

1. Create a new project in Supabase
2. Go to Project Settings > API to get your project URL and anon key
3. Run the migration script to set up the database schema:
   ```bash
   npm run migrate
   ```
4. Enable Email Auth in Authentication > Providers
5. Create your first admin user in the SQL Editor:
   ```sql
   insert into auth.users (email, role)
   values ('your-email@example.com', 'admin');
   ```

## Security Features

- Client-side encryption of sensitive veteran data
- Row Level Security (RLS) policies in Supabase
- Secure file storage with access controls
- Role-based access control for admin features

## Production Deployment

1. Create a production Supabase project
2. Set up your production environment variables
3. Build the project:
   ```bash
   npm run build
   ```
4. Deploy the contents of the `dist` folder to your web hosting provider

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
