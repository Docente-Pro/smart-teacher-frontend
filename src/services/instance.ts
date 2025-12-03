const prod_url = import.meta.env.VITE_PRODUCTION_API_URL;
const dev_url = import.meta.env.VITE_LOCAL_API_URL;

import axios from "axios";
export const instance = axios.create({
  baseURL: prod_url,
  headers: {
    "Content-Type": "application/json",
  },
});
