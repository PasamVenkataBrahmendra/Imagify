
# Imagify AI Deployment Instructions

## Deploying to Netlify

1. **Push to GitHub**: Push your current project code to a GitHub repository.
2. **Connect to Netlify**: 
   - Log in to Netlify.
   - Click "Add new site" > "Import from existing project".
   - Select your GitHub repository.
3. **Environment Variables**:
   - During the "Build & deploy" step, or after creation under **Site settings > Environment variables**, add the following:
     - `API_KEY`: Your Google Gemini API Key.
4. **Deploy**: Click "Deploy site".

## Firebase Setup
Ensure you have enabled the following in your Firebase Console:
1. **Authentication**: Enable Email/Password and Google Sign-in.
2. **Firestore**: Create a database in "Production mode" and apply the rules from `firestore-rules.txt`.
3. **Storage**: Enable Storage and apply the rules from `storage-rules.txt`.
