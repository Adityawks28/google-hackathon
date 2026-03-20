# UriCode - The GOAT of AI tutors

UriCode is a modern AI-powered platform for learning to code, where students solve programming problems with real-time feedback from an intelligent tutor.

The development repo is [here](https://github.com/Adityawks28/google-hackathon).

- All development was done
- The CI/CD pipeline is completely setup together with secrets

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
2. `cd` into the cloned directory
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

# Admin Panel

The UriCode platform includes a dedicated Admin panel located at `/admin` for managing the platform's content and users.

## Adding Admins

To grant admin access to a user, you must add their email address to the `admins` collection in Firestore. This is the recommended way to bootstrap the first admin in a new environment (like production).

1.  Open the **Firebase Console** and navigate to your **Firestore Database**.
2.  Create a collection named `admins` (if it doesn't already exist).
3.  Add a new document for each admin email:
    - **Document ID**: The user's exact email address (e.g., `admin@example.com`).
    - **Fields**:
      - `enabled`: `boolean` set to `true`.
      - `addedAt`: `number` (current timestamp, optional but recommended).

When a user with a registered admin email logs in for the next time, the system will automatically detect their status and promote their user document to have the `admin` role.

## Admin Capabilities

Once logged in as an admin, you can access the `/admin` dashboard to:

- **Seed Problems**: Quickly populate the database with a set of starter programming problems (e.g., FizzBuzz, Two Sum) using the "Seed Starter Problems" button. This is especially useful for setting up a fresh production environment.
- **Manage Problems**: View all existing problems, delete outdated ones, or navigate to the `/upload` page to create new challenges manually.
- **Generate AI Solutions**: Use the "Generate Solution" feature to automatically create a reference solution for any problem using the Gemini AI.
- **Manage Users**: View a list of all registered users and toggle their admin status directly from the UI.
