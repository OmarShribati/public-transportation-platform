import { API } from "./axios";
import { AxiosError } from "axios";

export interface RequestOptions {
  endpoint: string;
  id?: number | string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  params?: any;
  formData?: boolean;
  feature?: string;
}

export const APIService = {
  async request(options: RequestOptions) {    
    try {
      let url = options.endpoint;
      if (options.id) url += `/${options.id}`;

      let method: "GET" | "POST" | "PUT" | "DELETE";
      if (options.method) {
        method = options.method;
      } else if (options.id && options.data) {
        method = "PUT";
      } else if (options.data) {
        method = "POST";
      } else {
        method = "GET";
      }

      let payload = options.data;
      if (
        options.formData &&
        options.data &&
        !(options.data instanceof FormData)
      ) {
        const fd = new FormData();
        for (const key in options.data) {
          fd.append(key, options.data[key]);
        }
        payload = fd;
      }

      const res = await API({
        url,
        method,
        data: payload,
        params: options.params,
        headers: options.formData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
      });

      if (res.status >= 200 && res.status < 305) {
        return res.data;
      } else {
        const error = new AxiosError(
          res.statusText,
          String(res.status),
          undefined,
          undefined,
          res
        );
        throw error;
      }
    } catch (err) {
      throw err;
    }
  },
};
