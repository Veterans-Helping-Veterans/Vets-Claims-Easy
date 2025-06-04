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

- **Frontend**: Jekyll static site generator with HTML, CSS, and JavaScript
- **Styling**: Modern CSS with military-professional design system
- **Authentication**: Local Authentication system
- **Storage**: Browser Local Storage with encryption
- **Security**: CryptoJS for client-side encryption

## Getting Started

### Prerequisites

- Ruby (v2.7 or later)
- Bundler gem (`gem install bundler`)
- Node.js (v16 or later) - for additional tooling
- npm (included with Node.js)

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vets-claims-easy.git
   cd vets-claims-easy
   ```

2. Install Jekyll dependencies:
   ```bash
   bundle install
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   # Quick start (Node.js HTTP server):
   npm start

   # OR try Jekyll with fallback:
   ./dev-server.sh

   # OR manually with Jekyll:
   bundle exec jekyll serve --livereload --port 4000
   ```

5. Open the server URL in your browser:
   - Node.js server: http://localhost:3000
   - Jekyll server: http://localhost:4000

## Project Structure

```
├── _config.yml          # Jekyll configuration
├── _data/               # Site data files
├── _guides/             # Veterans guides and resources
├── _includes/           # Reusable HTML components
├── _layouts/            # Page templates
├── _pages/              # Static pages
├── _posts/              # Blog posts and articles
├── _resources/          # Resource documents
├── assets/              # CSS, JS, and images
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── images/         # Images and icons
├── about/              # About pages
├── blog/               # Blog section
├── guides/             # User guides
├── resources/          # Resource pages
├── support/            # Support pages
├── tools/              # Interactive tools
└── *.md                # Individual pages
```

## Security Features

- Client-side encryption of sensitive veteran data
- Secure local storage with access controls
- Role-based access control for admin features

## Production Deployment

1. Build the Jekyll site:
   ```bash
   bundle exec jekyll build
   # OR using npm script:
   npm run build
   ```

2. Deploy the contents of the `_site` folder to your web hosting provider

### Available Scripts

- `npm run dev` - Start Jekyll development server with live reload
- `npm run build` - Build the site for production
- `npm run clean` - Clean build artifacts
- `npm start` - Start simple HTTP server for testing

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# vetswebsite
# vetswebsite
