# gemini-lighthouse
second attempt using gemini
Telegram Beacon Project Setup Guide

This guide will walk you through setting up and deploying your real-time beacon application.

🚀 How It Works

You send a message to your private Telegram Bot.

Telegram sends this message to a Vercel Serverless Function.

The Vercel function writes the message and a 1-hour expiration time to a Firebase Firestore database.

The Web App is listening for real-time changes to the Firestore database.

When the database updates, the web app instantly lights up the beacon and displays your message.

🛠️ Step 1: Set up Firebase

Create a Firebase Project:

Go to the Firebase Console.

Click "Add project" and follow the on-screen instructions.

Create a Firestore Database:

In your project, go to the "Build" section and click "Firestore Database".

Click "Create database" and start in production mode.

Choose a location closest to you.

Set Security Rules:

Go to the "Rules" tab in Firestore.

Replace the default rules with the following to allow anyone to read, but keep writes restricted (our serverless function will handle writes securely).

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /beacon/status {
      allow read: if true;
      allow write: if false; // Only our backend can write
    }
  }
}


Click Publish.

Get Web App Configuration:

Go to "Project Settings" (click the gear icon).

Under "Your apps", click the web icon (</>).

Register the app (give it a nickname like "Beacon Frontend").

You will be given a firebaseConfig object. Copy this object.

Paste this object into your index.html file where indicated.

Generate a Service Account Key (for the backend):

In Project Settings, go to the "Service accounts" tab.

Click "Generate new private key". A JSON file will be downloaded.

Keep this file secure! We will use its contents in a later step.

🤖 Step 2: Set up Telegram Bot

Create a Bot:

Open Telegram and search for the user @BotFather.

Start a chat and send the /newbot command.

Follow the prompts to name your bot.

BotFather will give you a Bot Token. Save this token—it's very important.

☁️ Step 3: Deploy with GitHub and Vercel

Create a GitHub Repository:

Create a new, empty repository on GitHub.

Upload Your Files:

Create a folder named api in your project locally.

Place index.html and package.json in the root of your project folder.

Place webhook.js inside the api folder.

Your project structure should look like this:

/
├── index.html
├── package.json
└── api/
    └── webhook.js


Push this project to your new GitHub repository.

Create a Vercel Project:

Sign up or log in to Vercel using your GitHub account.

On your dashboard, click "Add New... -> Project".

Import the GitHub repository you just created.

Vercel will automatically detect the project settings.

Add Environment Variables:

In your new Vercel project's settings, go to the "Environment Variables" section.

We need to add two variables:

TELEGRAM_BOT_TOKEN:

Key: TELEGRAM_BOT_TOKEN

Value: Paste the Bot Token you got from BotFather.

FIREBASE_SERVICE_ACCOUNT_BASE64:

Key: FIREBASE_SERVICE_ACCOUNT_BASE64

Value:

Open the JSON service account file you downloaded from Firebase.

Copy the entire content of the file.

Go to a Base64 encoder site like base64encode.org.

Paste the JSON content and encode it.

Copy the resulting Base64 string and paste it here as the value.

Deploy:

Go to the "Deployments" tab and trigger a new deployment to apply the environment variables.

Once the deployment is complete, Vercel will give you a public URL (e.g., https://your-project.vercel.app).

🔗 Step 4: Connect Telegram to Vercel

The final step is to tell Telegram where to send messages.

Get your Vercel function URL. It will be your deployment URL plus /api/webhook.

Example: https://your-project.vercel.app/api/webhook

Set the webhook by running the following command in your terminal. Replace <YOUR_BOT_TOKEN> and <YOUR_VERCEL_WEBHOOK_URL> with your actual values. This command uses your bot token as a secret token in the header.

curl --request POST \
     --url [https://api.telegram.org/bot](https://api.telegram.org/bot)<YOUR_BOT_TOKEN>/setWebhook \
     --header 'content-type: application/json' \
     --data '{"url": "<YOUR_VERCEL_WEBHOOK_URL>", "secret_token": "<YOUR_BOT_TOKEN>"}'


If it's successful, you will see a response like: {"ok":true,"result":true,"description":"Webhook was set"}.

Your beacon is now live! Send a message to your bot in Telegram, and watch the web app light up.
