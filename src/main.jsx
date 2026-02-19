import { createRoot } from "react-dom/client";
import axios from "axios";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import APP from "./App";
import { store } from "./pages/redux/Store";
import "./index.css";

const AUTH_TOKEN_KEY = "vingo_auth_token";

if (!globalThis.__VINGO_AXIOS_READY__) {
  axios.defaults.withCredentials = true;

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => {
      const token = response?.data?.token;
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      }
      return response;
    },
    (error) => Promise.reject(error)
  );

  globalThis.__VINGO_AXIOS_READY__ = true;
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <APP />
    </Provider>
  </BrowserRouter>
);
