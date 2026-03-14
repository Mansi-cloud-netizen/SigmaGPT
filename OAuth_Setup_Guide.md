# How to Fix "OAuth Client Not Found" and "Invalid Page" Errors

The issue you are seeing when clicking on **Sign in with Google/Facebook** happens because the Node.js backend does not have legitimate `CLIENT_ID` and `CLIENT_SECRET` keys in its `.env` file to identify your app to Google/Facebook. 

Currently, they are defaulting to placeholder text (`dummy_client_id`), which causes Google and Facebook to explicitly reject the sign-in request (saying "OAuth client not found" and "Invalid Page").

You will need to manually generate these keys for your application. This is a standard step for setting up social logins.

## 🟢 Step 1: Getting Google Keys (Fixes "OAuth Client Not Found")

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **New Project** (Call it something like "SigmaGPT").
3. In the left sidebar, navigate to **APIs & Services** -> **Credentials**.
4. Click **+ CREATE CREDENTIALS** -> **OAuth client ID**.
   - If prompted, you will need to "Configure Consent Screen" first. Fill out the mandatory fields (App name, User support email, Developer contact email) and click Save and Continue through the steps. Make sure to publish the app or add yourself as a test user!
5. For Application Type, select **Web application**.
6. Name it (e.g., "SigmaGPT Web Client").
7. **CRITICAL STEP**: Under **Authorized redirect URIs**, add this exact URL:
   `http://localhost:8080/api/auth/google/callback`
8. Click **Create**.
9. You will be given a **Client ID** and a **Client Secret**.

## 🔵 Step 2: Getting Facebook Keys (Fixes "Invalid Page")

1. Go to the [Facebook Developers Portal](https://developers.facebook.com/).
2. Create an account/login, and click **My Apps** -> **Create App**.
3. Select **Allow people to log in with their Facebook account** and click Next.
4. Name your app "SigmaGPT".
5. In your App Dashboard, navigate to **App settings** -> **Basic**. Here you'll find the **App ID** and **App Secret** (click "Show" to reveal it).
6. In the left navigation bar, go to **Facebook Login** -> **Settings**.
7. **CRITICAL STEP**: Under **Valid OAuth Redirect URIs**, add this exact URL:
   `http://localhost:8080/api/auth/facebook/callback`
8. Save changes.

## 🟡 Step 3: Adding the Keys to Your Environment

1. Open your `c:\Users\Mansi Kamdar\Apna College\SigmaGPT\Backend\.env` file.
2. Add the four keys you just generated exactly like this:

```env
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here

FACEBOOK_APP_ID=your_actual_facebook_app_id_here
FACEBOOK_APP_SECRET=your_actual_facebook_app_secret_here
```

3. Save the file. The Backend (using `nodemon`) will automatically restart and pick up the new keys. 

Now, when you click the buttons on the frontend, Google and Facebook will recognize your app correctly!
