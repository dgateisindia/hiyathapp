// import axios from "axios";
// import { Platform } from "react-native";

// const DEVELOPMENT_API_URL = Platform.select({
//   android: "http://192.168.1.16:3000/api",
//   ios: "http://192.168.1.22:3000/api",
//   default: "http://localhost:3000/api",
// });

// const PRODUCTION_API_URL = "http://13.201.150.61/api";

// const api = axios.create({
//   baseURL: __DEV__ ? DEVELOPMENT_API_URL : PRODUCTION_API_URL,
//   timeout: 15000,
// });

// export default api;



// import axios from "axios";
// import { Platform } from "react-native";

// const LOCAL_API_URL = Platform.select({
//   android: "http://192.168.1.16:5000/api",
//   ios: "http://192.168.1.22:5000/api",
//   default: "http://localhost:5000/api",
// });

// const EC2_API_URL = "http://13.201.150.61/api";

// const USE_EC2_DURING_DEVELOPMENT = true;

// const api = axios.create({
//   baseURL:
//     __DEV__ && !USE_EC2_DURING_DEVELOPMENT
//       ? LOCAL_API_URL
//       : EC2_API_URL,
//   timeout: 15000,
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://13.201.150.61/api",
  timeout: 15000,
});

console.log("Current API URL:", api.defaults.baseURL);

export default api;