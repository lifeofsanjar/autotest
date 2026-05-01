import axios from "axios";
import { refreshAccessToken } from "./authService";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: "https://test.premieravtotest.uz/api",
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  })
  
  isRefreshing = false;
  failedQueue = [];
}

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Token decode error:", error);
    return true;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    
    // Check if token is expired before sending request
    if (token && isTokenExpired(token)) {
      console.log("Token expired, attempting refresh before request");
      localStorage.removeItem("accessToken");
      // Don't set token header, let response interceptor handle refresh
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    // Handle 401 Unauthorized by refreshing token
    if (response?.status === 401 && config && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          config.headers.Authorization = `Bearer ${token}`;
          return api(config);
        }).catch(err => Promise.reject(err));
      }

      config._retry = true;
      isRefreshing = true;

      return refreshAccessToken()
        .then((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(config);
        })
        .catch((err) => {
          processQueue(err, null);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          // Redirect to login on refresh failure
          console.error("Token refresh failed, redirecting to login");
          window.location.href = "/login";
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

export default api;