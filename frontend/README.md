# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install

   ```bash
   npx create-expo-app@latest
   &
   file name - frontend
   ```

2. Start the app

   ```bash
   npm run start
   ```
3. Reset project
   npm run reset-project
   &
   select (y/n): n

**Frontend**
4. Follow this website instruction - https://www.nativewind.dev/docs/getting-started/installation
   npm install nativewind react-native-reanimated react-native-safe-area-context
   npm install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo

5. Setup Tailwind CSS
   Run npx tailwindcss init to create a tailwind.config.js file
   and paste code.

6. Create a CSS file global.css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;


7. Add the Babel preset
   babel.config.js
   and paste code.

8. Create or modify your metro.config.js
   and paste code.

5. Import your CSS file
   App.js
   import "@/global.css";
 
6. Modify your app.json
   {
   "expo": {
      "web": {
         "bundler": "metro"
      }
   }
   }

7. TypeScript setup
   create file name nativewind-env.d.ts
   paste code 
   /// <reference types="nativewind/types" />

**Backend**
8. create backend folder in root folder
   mkdir backend
   cd backend
   npm init -y

9. Required packages install karo
   npm install express cors dotenv
   npm install --save-dev nodemon

10. .env file banao

11. server.js (main file)

12. Run server
   node server.js or npx nodemon server.js (recommended)
   Browser open:
   http://localhost:5000