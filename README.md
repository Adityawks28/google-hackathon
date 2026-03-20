# UriCode - The GOAT of AI tutors

UriCode is a modern AI-powered platform for learning to code, where students solve programming problems with real-time feedback from an intelligent tutor.

# External dependencies

To get started with UriCode, you'll need:

- **Docker**: For running the Firebase emulator environment.
- **Lefthook**: For managing pre-commit hooks and ensuring code quality.
- **Node.js & npm**: To run the Next.js frontend.
- **Firebase CLI (Optional)**: Only needed for manual tasks like rule management or generating CI tokens. The project includes a Dockerized emulator suite that handles this for local development.
- **Python 3.11+**: Required for Firebase Functions.

# Terraform

The infrastructure is managed using Terraform: [https://github.com/kevinher7/terraform-hack](https://github.com/kevinher7/terraform-hack)

Managing the infrastructure requires the **Google Cloud CLI (`gcloud`)**. The full setup instructions, including IAM permissions and Firebase configuration details, are located in the [Terraform repository](https://github.com/kevinher7/terraform-hack).

# Local Development

Follow these steps to get the project running locally:

1. `git clone <repository-url>`
2. `cd ./`
3. `cp .env.dist .env` (Make sure to add your `GOOGLE_GEMINI_API_KEY`)
4. `npm install`
5. `docker compose up -d`
6. `npm run seed` (Seed the local emulator with initial problems)
7. `npm run dev`

The website should be running on [http://localhost:3000](http://localhost:3000).

> **Note**: The default `.env.dist` variables work by default with the local firebase emulator setup. No need to use production credentials for local development.

## Docker Compose

The project uses Docker Compose to spin up a full Firebase Emulator suite, allowing you to develop without touching production data. The following emulators are used:

- **Emulator UI**: [http://localhost:4000](http://localhost:4000)
- **Firestore**: [http://localhost:8080](http://localhost:8080)
- **Auth**: [http://localhost:9099](http://localhost:9099)
- **Storage**: [http://localhost:9199](http://localhost:9199)
- **Functions**: [http://localhost:5001](http://localhost:5001)

# Firebase Project Setup (Production)

For full production deployment, you'll need a Firebase project.

1.  **Create a Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Features**: You have two options to enable the required features (Firestore, Authentication, Storage, and Functions):
    - **Option A (Terraform - Recommended)**: Use the [Terraform repository](https://github.com/kevinher7/terraform-hack) to automate the setup. This is recommended as SSR is handled via Cloud Functions and requires specific IAM permissions.
    - **Option B (Manual)**: In the Firebase Console, manually enable:
      - **Firestore Database** (Start in Test Mode or Production with proper rules).
      - **Authentication** (Enable Google Sign-In).
      - **Storage** (Enable default bucket).
      - **Functions** (Ensure Python support is available).

# GitHub Secrets

To enable automatic deployment via GitHub Actions, add the following secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):

- `FIREBASE_TOKEN`: Obtain by running `firebase login:ci` (requires local Firebase CLI).
- `GOOGLE_GEMINI_API_KEY`: Your Google Gemini API key.
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Your Firebase project's API key.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Your Firebase project's auth domain.
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Your Firebase project ID.
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket.
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID.
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Your Firebase app ID.

# Deployment

Deployment is handled automatically via GitHub Actions. The `deploy.yaml` workflow sets up the environment and deploys the Next.js application and Firebase Functions to production whenever changes are pushed to the `main` branch.
