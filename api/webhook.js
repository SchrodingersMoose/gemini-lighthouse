// Vercel Serverless Function
// This file should be placed in the `api` directory of your project.
// e.g., `api/webhook.js`

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// --- IMPORTANT: Service Account Credentials ---
// These will be loaded from Vercel Environment Variables, NOT hardcoded.
// The JSON key file from Firebase should be converted to a base64 string.
const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii')
);

// --- IMPORTANT: Telegram Bot Token ---
// This will also be a Vercel Environment Variable.
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Initialize Firebase Admin SDK
// This check prevents re-initializing the app on every serverless function invocation
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

// The main handler for the serverless function
export default async function handler(request, response) {
    // Check if it's a POST request
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message } = request.body;

        // A simple security check: Ensure the request comes from your bot
        // This is a basic check. For production, you could use a secret path.
        const botSecret = request.headers['x-telegram-bot-api-secret-token'];
        if (botSecret !== TELEGRAM_BOT_TOKEN) {
             console.warn('Unauthorized attempt to access webhook.');
            // We return 200 to prevent Telegram from retrying.
             return response.status(200).send('OK');
        }


        if (message && message.text) {
            console.log(`Received message: "${message.text}"`);

            // Calculate expiration time (1 hour from now)
            const expireAt = new Date(Date.now() + 60 * 60 * 1000);

            // Get a reference to the document
            const beaconDocRef = db.collection('beacon').doc('status');

            // Set the data in Firestore
            await beaconDocRef.set({
                message: message.text,
                receivedAt: new Date(),
                expireAt: expireAt,
                active: true,
            });

            console.log('Successfully updated beacon status in Firestore.');

            // Respond to Telegram to acknowledge receipt
            return response.status(200).json({ status: 'OK', message: 'Beacon activated' });
        }

        // If no message text, just acknowledge
        return response.status(200).json({ status: 'OK', message: 'No action taken' });

    } catch (error) {
        console.error('Error processing webhook:', error);
        // We send a 200 OK even on errors to prevent Telegram from spamming our function with retries.
        // We log the error on the server for debugging.
        return response.status(200).json({ status: 'Error', message: 'Internal server error' });
    }
}
