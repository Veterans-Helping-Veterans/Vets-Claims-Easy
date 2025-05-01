# Veterans Claims Assistance Portal

A secure web application for veterans to submit VA claim assistance requests, with an admin-only interface to view and manage submissions.

## Features

- **Public-facing submission form** for veterans to request assistance with VA claims
- **Secure admin login** to access and manage submitted requests
- **Admin dashboard** to view, filter, and update the status of claim requests
- **Responsive design** that works on desktop and mobile devices
- **File attachment support** for military medical records and VA claim letters

## Technology Stack

- **Frontend**: HTML, JavaScript, and Tailwind CSS
- **Backend**: Firebase (Realtime Database, Authentication, Storage)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage for file uploads

## Getting Started

### Prerequisites

- Any modern web browser
- A web server (optional for local development)
- Firebase account (for backend functionality)

### Firebase Setup Instructions

This application uses Firebase for authentication, database, and storage. Follow these steps to set up Firebase for this project:

1. **Create a Firebase Project**
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the prompts to create a new project
   - Name your project (e.g., "Vets-Claims-Easy")

2. **Register Your Web App**
   - In the Firebase console, click on the web icon (</>) to add a web app
   - Register your app with a nickname (e.g., "Vets Claims Easy Web")
   - Copy the Firebase configuration object

3. **Update Firebase Configuration**
   - Open `js/firebase-config.js`
   - Replace the existing configuration with your Firebase configuration

4. **Set Up Firebase Authentication**
   - In the Firebase console, go to "Build" → "Authentication"
   - Click "Get started"
   - Enable "Email/Password" authentication
   - Add an admin user (email and password)

5. **Set Up Firebase Realtime Database**
   - In the Firebase console, go to "Build" → "Realtime Database"
   - Click "Create Database"
   - Choose a location (usually the default is fine)
   - Start in test mode for now (you can adjust security rules later)
   - Add the database URL to your configuration in `js/firebase-config.js`

6. **Set Up Firebase Storage**
   - In the Firebase console, go to "Build" → "Storage"
   - Click "Get started"
   - Accept the default security rules for now
   - Choose a location (usually the default is fine)


## Security Considerations

This application uses Firebase for backend functionality with the following security considerations:

- Firebase Authentication is used for admin access
- Data is stored in Firebase Realtime Database
- Files are stored in Firebase Storage
- Basic encryption is implemented for sensitive data
- In a production environment, you should:
  - Configure proper Firebase security rules
  - Implement more robust encryption for sensitive data
  - Set up proper error handling and logging
  - Enforce HTTPS
  - Implement rate limiting

### Firebase Security Rules

For production, update the Firebase security rules to restrict access:

#### Realtime Database Rules

```json
{
  "rules": {
    "claims": {
      ".read": "auth != null",
      ".write": true
    },
    "claimsByDate": {
      ".read": "auth != null",
      ".write": true
    },
    "test": {
      ".read": true,
      ".write": true
    }
  }
}
```

#### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /claims/{claimId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if true;
    }
  }
}
```

## Enhancing for Production

To further enhance this application for production:

1. Implement more robust server-side validation
2. Set up email notifications for new submissions
3. Implement multi-factor authentication for admin access
4. Add comprehensive logging and monitoring
5. Set up automated backups for the database

## Troubleshooting

If you encounter issues with Firebase:

1. **Check the browser console** for error messages
2. **Verify your Firebase configuration** values in `js/firebase-config.js`
3. **Ensure your Firebase project** has the necessary services enabled (Authentication, Realtime Database, Storage)
4. **Check that your security rules** allow the operations you're trying to perform
5. **Verify that your Content Security Policy** allows connections to Firebase domains
6. **Test the Firebase connection** using the test panel in the bottom-left corner of the index page

## License

This project is licensed under the MIT License - see the LICENSE file for details.
