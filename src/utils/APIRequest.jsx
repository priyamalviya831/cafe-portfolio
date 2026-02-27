import { api_enums } from "./api";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  const data = await response.json(); // ✅ read once
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const getBody = (data) =>
  data instanceof FormData ? data : JSON.stringify(data);

export const getAccessToken = () => {
  return localStorage.getItem(api_enums.JWT_ACCESS_TOKEN)
    ? localStorage.getItem(api_enums.JWT_ACCESS_TOKEN)
    : window.localStorage.getItem(api_enums.JWT_ACCESS_TOKEN);
};

const getHeaders = (body = {}) => {
  return {
    ...(getAccessToken() && { Authorization: `Bearer ${getAccessToken()}` }),
    ...(!(body instanceof FormData) && { "Content-Type": "application/json" }),
  };
};

const buildQueryString = (params) => {
  return Object.keys(params)
    .map((key) => {
      const value = encodeURIComponent(params[key]).replace(/%2C/g, ",");
      return `${encodeURIComponent(key)}=${value}`;
    })
    .join("&");
};

export const APIRequest = {
  get: async (endpoint, params = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${BASE_URL}/${endpoint}?${queryString}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  post: async (endpoint, data, params = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${BASE_URL}/${endpoint}?${queryString}`, {
      method: "POST",
      headers: getHeaders(data),
      body: getBody(data),
    });
    return handleResponse(response);
  },
  put: async (endpoint, data, params = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${BASE_URL}/${endpoint}?${queryString}`, {
      method: "PUT",
      headers: getHeaders(data),
      body: getBody(data),
    });
    return handleResponse(response);
  },
  patch: async (endpoint, data, params = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${BASE_URL}/${endpoint}?${queryString}`, {
      method: "PATCH",
      headers: getHeaders(data),
      body: getBody(data),
    });
    return handleResponse(response);
  },
  remove: async (endpoint, params = {}, data = {}) => {
    const queryString = buildQueryString(params);
    const response = await fetch(`${BASE_URL}/${endpoint}?${queryString}`, {
      method: "DELETE",
      headers: getHeaders(),
      body: getBody(data),
    });
    return handleResponse(response);
  },
};
