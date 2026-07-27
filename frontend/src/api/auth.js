import api from "./axios.js";

export function login(data) {
  return api.post("/auth/login", data);
}

export function resetPassword(data) {
  return api.post("/auth/reset-password", data);
}

export function logout() {
  return api.post("/auth/logout");
}

export function getCurrentUser() {
  return api.get("/auth/me");
}
