# GitHub Pages Setup for Veterans Claims Assistance Portal

This document provides instructions for setting up this application on GitHub Pages with Firebase integration.

## Step 1: Enable GitHub Pages in Repository Settings

1. Go to your GitHub repository: https://github.com/Veterans-Helping-Veterans/Vets-Claims-Easy
2. Click on "Settings" (tab at the top)
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select the "gh-pages" branch
5. Click "Save"

Your site will be published at: https://veterans-helping-veterans.github.io/Vets-Claims-Easy/

## Step 2: Configure Firebase for GitHub Pages

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project "vets-claims-easy"
3. Go to "Authentication" → "Settings" → "Authorized domains"
4. Add your GitHub Pages domain: `veterans-helping-veterans.github.io`
5. Click "Add"

## Step 3: Update Firebase Security Rules

### Realtime Database Rules

1. Go to "Realtime Database" → "Rules"
2. Update the rules to:
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
3. Click "Publish"

### Storage Rules

1. Go to "Storage" → "Rules"
2. Update the rules to:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /claims/{claimId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if true;
    }
    match /test/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click "Publish"

## Step 4: Testing Your GitHub Pages Site

1. Open your GitHub Pages URL: https://veterans-helping-veterans.github.io/Vets-Claims-Easy/
2. Look for the "Firebase Connection Test" panel in the bottom-left corner of the index page
3. Click the "Test Connection" button
4. If successful, you'll see a green checkmark and confirmation message

## Troubleshooting

If you encounter issues with your GitHub Pages site:

1. **Check the browser console** for error messages (F12 or right-click → Inspect → Console)
2. **Verify Firebase configuration** in `js/firebase-config.js`
3. **Check Firebase Console** to ensure all services are enabled
4. **Verify GitHub Pages settings** in your repository settings
5. **Check Content Security Policy** in your HTML files to ensure it allows connections to Firebase domains

## Common Issues and Solutions

1. **Authentication fails**: Make sure you've added `veterans-helping-veterans.github.io` to the authorized domains in Firebase Authentication settings.
2. **Storage uploads fail**: Check your Storage rules to ensure they allow uploads from your GitHub Pages domain.
3. **Database reads/writes fail**: Verify your Realtime Database rules allow the operations you're trying to perform.
4. **CORS errors**: Ensure your Content Security Policy includes all necessary Firebase domains.
