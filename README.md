# Imagify AI Deployment Instructions

## Deploying to Vercel

1. **Push to GitHub**: Push your current project code to a GitHub repository.
2. **Connect to Vercel**: 
   - Log in to [Vercel](https://vercel.com).
   - Click "Add New" > "Project".
   - Import your GitHub repository.
3. **Environment Variables**:
   - In the "Configure Project" screen, expand the **Environment Variables** section.
   - Add the following:
     - **Key**: `API_KEY`
     - **Value**: Your Google Gemini API Key (get it from [AI Studio](https://aistudio.google.com/)).
4. **Deploy**: Click "Deploy". Vercel will automatically detect the static setup and serve your app.

## Firebase Setup
Ensure you have enabled the following in your Firebase Console:
1. **Authentication**: Enable Email/Password and Google Sign-in.
2. **Firestore**: Create a database in "Production mode" and apply the rules from `firestore-rules.txt`.
3. **Storage**: Enable Storage and apply the rules from `storage-rules.txt`.

## How to find your API Key
1. Go to [Google AI Studio API Keys](https://aistudio.google.com/app/apikey).
2. Create a new API key.
3. Copy it into the `API_KEY` environment variable in the Vercel dashboard.