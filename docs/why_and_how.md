# QUE. why does expo has a project from my local in there dashboard
https://expo.dev/accounts/ujjwalanand678/projects/daily_to_do
=> Expo shows your local project on the Expo dashboard because your project is linked to your Expo account via the project config and CLI login.
Why your local project appears on Expo dashboard

=>When you ran any of these:
npx expo start
npx expo login
npx expo prebuild
npx expo publish
npx expo export
npx expo doctor

=>Expo CLI:
Logged you into your Expo account
Read your project config (app.json / app.config.js)
Created (or linked) a project on Expo servers
Assigned a project ID
Synced metadata to expo.dev dashboard

So your local project becomes a cloud-linked project.

=>When Expo creates dashboard project

Expo auto-creates when you:

run expo publish
run expo start (newer CLI sometimes registers)
run eas build
run eas init
run expo prebuild

Most commonly: eas init created it.

#Method: Build APK using Expo (EAS Build)
Step 1 — Install EAS CLI

From your project folder:

npm install -g eas-cli

Login:

eas login
Step 2 — Initialize build config

Run:

eas build:configure

This creates:

eas.json

Example:

{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
preview → builds APK
production → builds Play Store AAB
Step 3 — Build APK

Run:

eas build -p android --profile preview

Expo will:

Upload project
Install dependencies
Build Android app
Generate APK
Give download link

Example output:

✔ Build finished
https://expo.dev/artifacts/xxxxxxxx.apk

Download → install on phone.

What Expo does behind the scenes

Expo cloud:

Your code → Expo servers → Android build → APK → download link

You don’t need:

Android Studio
SDK
Gradle setup
Java config

Expo handles everything.

If you want installable APK (for testing)

Use:

eas build -p android --profile preview
If you want Play Store upload file

Use:

eas build -p android --profile production

That generates .aab

After build finishes

Expo dashboard will show:

build status
QR install link
APK download button
version history

Your project page:

expo.dev → your project → builds → download APK
Common first-time question

Expo will ask:

Generate new Android Keystore? (Y/n)

Press:

Y

Expo securely stores it.

One-command summary

Just run this:

eas build -p android --profile preview

That’s it.

##Follow exactly these steps for an Expo app with Google Sign-In + Drive API. You are already on the Create OAuth client ID screen — good.

You must create TWO client IDs:

Web client (required for Expo)
Android client (required for real device / APK)
Step 1 — Create WEB client ID (do this first)

On the screen you showed:

Select:

Application type → Web application

Then fill:

Name:

Expo Web Client

Authorized redirect URIs → click ADD URI:

Paste:

https://auth.expo.io/@ujjwalanand678/daily_to_do

Important format:

https://auth.expo.io/@EXPO_USERNAME/SLUG

Your values:

username: ujjwalanand678
slug: daily_to_do

Click:

Create

Copy the Client ID
It looks like:

123456-abc.apps.googleusercontent.com

Save this → WEB_CLIENT_ID

Step 2 — Create ANDROID client ID

Click:

Create client → OAuth client ID

Select:

Application type → Android

Now you need:

Package name

Open your Expo app.json

Look for:

"android": {
  "package": "com.yourapp.name"
}

Example:

com.ujjwalanand.dailytodo

Paste that.

SHA-1 (Expo will give this)

Run:

eas credentials

Choose:

Android → production → view keystore

Copy SHA-1

Paste into Google Cloud.

Click:

Create

Copy Android client ID.

Save as:

ANDROID_CLIENT_ID
Step 3 — You should now have

You must have:

WEB_CLIENT_ID
ANDROID_CLIENT_ID
Step 4 — Update googleDriveSync.ts

Put:

export const GOOGLE_CLIENT_IDS = {
  web: "WEB_CLIENT_ID",
  android: "ANDROID_CLIENT_ID",
  expo: "WEB_CLIENT_ID"
}
Step 5 — Use correct scopes

Make sure you use:

scopes: [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/drive.file"
]

NOT full drive access.

Step 6 — Add test user (important)

Go to:

OAuth Consent Screen → Audience → Test users

Add your Gmail.

Otherwise login will fail.

Step 7 — Test

Run:

npx expo start

Then:

press a for android
OR
scan with Expo Go

Google sign in should open.

Your Android package name is:

com.ujjwalanand678.daily_to_do

Now follow these exact steps on the screen you're currently on.

Step 1 — Create Web OAuth Client (Expo required)

You're on Create OAuth client ID

Select:

Application type → Web application

Name:

Expo Web Client

Authorized redirect URIs → ADD URI:

https://auth.expo.io/@ujjwalanand678/daily_to_do

Click Create

Copy:

WEB_CLIENT_ID
Step 2 — Create Android OAuth Client

Click Create client again

Select:

Application type → Android

Fill:

Package name:

com.ujjwalanand678.daily_to_do

Now you need SHA-1

Step 3 — Get SHA-1 from Expo (correct way)

Run in project:

eas credentials

Choose:

Android
→ production
→ Keystore
→ View

Copy SHA-1

Paste into Google Cloud.

Click:

Create

Copy:

ANDROID_CLIENT_ID
Step 4 — You now have two IDs

You should have:

WEB_CLIENT_ID
ANDROID_CLIENT_ID

Example:

123...apps.googleusercontent.com
456...apps.googleusercontent.com
Step 5 — Add into your Expo app

Update googleDriveSync.ts:

export const GOOGLE_CLIENT_IDS = {
  expo: "WEB_CLIENT_ID",
  web: "WEB_CLIENT_ID",
  android: "ANDROID_CLIENT_ID"
}
Step 6 — Enable Google Drive API (don't skip)

Go to:

APIs & Services → Library
Search:

Google Drive API

Click Enable

Step 7 — Add test user (important)

Go to:

OAuth → Audience → Test users → Add user

Add your Gmail.

Step 8 — Test

Run:

npx expo start

OR build:

eas build -p android --profile preview

Install → test Google login → Drive sync.

Your redirect URI (based on your config)

Use exactly:

https://auth.expo.io/@ujjwalanand678/daily_to_do

If this is wrong, login will fail.

If you paste:

your googleDriveSync.ts

I'll verify it's wired correctly.