import { useQuery, useMutation } from "@tanstack/react-query";
import { APIRequest } from "./APIRequest";

// Default query options
const defaultQueryOptions = {
  retry: 1, // Retry failed requests once
  refetchOnWindowFocus: false, // Do not refetch when window regains focus
  staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
  cacheTime: 1000 * 60 * 10, // Cache the data for 10 minutes
};

const useFetch = (key, endpoint, params = {}, options = {}) => {
  return useQuery({
    queryKey: [key, params],
    queryFn: () => APIRequest.get(endpoint, params),
    ...defaultQueryOptions,
    ...options,

    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,          // data becomes stale immediately
    refetchInterval: false
  });
};

// const usePost = (endpoint, options = {}, params) => {
//   return useMutation({
//     mutationFn: (data) => APIRequest.post(endpoint, data, params),
//     ...options,
//   });
// };
const usePost = <TResponse = any, TPayload = any>(
  endpoint: string,
  options: any = {},
  params: any = {}
) => {
  return useMutation<TResponse, Error, TPayload>({
    mutationFn: (payload: TPayload) => {
      // console.log("🚀 POST API HIT 👉", endpoint, payload);
      return APIRequest.post(endpoint, payload, params);
    },
    ...options,
  });
};


const usePut = <TResponse = any, TPayload = any>(
  endpoint: string,
  options: any = {}
) => {
  return useMutation<TResponse, Error, TPayload>({
    mutationFn: (payload: TPayload) => APIRequest.put(endpoint, payload),
    ...options,
  });
};

const usePatch = <TResponse = any, TPayload = any>(
  endpoint: string,
  options: any = {}
) => {
  return useMutation<TResponse, Error, TPayload>({
    mutationFn: (payload: TPayload) => APIRequest.patch(endpoint, payload),
    ...options,
  });
};

const useDelete = <TResponse = any, TPayload = any>(
  endpoint: string,
  options: any = {}
) => {
  return useMutation<TResponse, Error, TPayload>({
    mutationFn: (data: TPayload) => {
      if (data && typeof data === "object" && "id" in data) {
        const { id, ...body } = data as any;
        return APIRequest.remove(`${endpoint}/${id}`, {}, body);
      }

      return APIRequest.remove(
        `${endpoint}/${typeof data === "string" ? data : ""}`,
        {},
        typeof data === "object" ? data : {},
      );
    },
    ...options,
  });
};

export { useFetch, usePost, usePut, usePatch, useDelete };