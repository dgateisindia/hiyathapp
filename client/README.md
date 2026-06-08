Hiyath E-commerce app

Technology:
Frontend: react native
Backend: node js, express js
Database: MySql

Creating new Project using React native expo:
- npx create-expo-app@latest
app name: client

----------------------------------------------------------------------------------------------------------------------------------
Installation with Expo:
Install Nativewind:
- npm install nativewind react-native-reanimated react-native-safe-area-context

- npm install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo

----------------------------------------------------------------------------------------------------------------------------------
Setup Tailwind CSS:
- Run npx tailwindcss init 
to create a tailwind.config.js file

----------------------------------------------------------------------------------------------------------------------------------
Paste this code in tailwind.config.js file:
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

----------------------------------------------------------------------------------------------------------------------------------

Create the global.css file
@tailwind base;
@tailwind components;
@tailwind utilities;


----------------------------------------------------------------------------------------------------------------------------------
Add the Babel preset
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};

----------------------------------------------------------------------------------------------------------------------------------
Create a metro.config.js file in the root of your project if you don't already have one, then add the following configuration:
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)
 
module.exports = withNativeWind(config, { input: './global.css' })

----------------------------------------------------------------------------------------------------------------------------------

Import your CSS file:
import "./global.css"
 
export default App() {
  /* Your App */
}

----------------------------------------------------------------------------------------------------------------------------------
Modify your app.json

  "expo": {
    "web": {
      "bundler": "metro"
    }
  }

----------------------------------------------------------------------------------------------------------------------------------
TypeScript setup (optional)
If you're using TypeScript in your project, you'll need to set up the type definitions. Nativewind extends the React Native types via declaration merging. The simplest method to include the types is to create a new nativewind-env.d.ts file and add a triple-slash directive referencing the types.
/// <reference types="nativewind/types" />


----------------------------------------------------------------------------------------------------------------------------------
To display the toast message
- npm install react-native-toast-message



----------------------------------------------------------------------------------------------------------------------------------
image picker library:
- npm install react-native-image-picker

----------------------------------------------------------------------------------------------------------------------------------
**Steps to Run the project on Computer:**
1. Open VS code & the terminal
2. In terminal type cd client and hit enter
3. Open Android studio and launch Android emulator
4. In vs code terminal type
   - npx expo start
     and type a
5. The project will launch in Android emulator

--------------------------------------------------------------

Clerk authentication libraries
- npx expo install @clerk/clerk-expo

After installing the clerk, run
 - npm run start

-----------------------------------------------------------------

Starting the backend server
1. Go into server folder uisng cmd
- cd server

2. Run this command
- npm run server

-------------------------------------------------------------------

**Install ngrok to create a public internet URL for your localhost application.**

1. install ngrok
- npm install -g ngrok

2. create a account in ngrok website
- https://dashboard.ngrok.com/signup?utm_source=chatgpt.com

3. Get your Authtoken
After logging in, open:

- https://dashboard.ngrok.com/get-started/your-authtoken?utm_source=chatgpt.com

You'll see something like:
- ngrok config add-authtoken 2abcXYZ...

Copy the entire command.

4. Run the command in your terminal
Example: 
- ngrok config add-authtoken 3EWOBKzhyMu2GBeZdnernNUxhb0_3WmFDHNiosRftDSFM7FSV

5. Start ngrok
- ngrok http 3000

You should get:

Forwarding https://xxxxx.ngrok-free.app -> http://localhost:3000
