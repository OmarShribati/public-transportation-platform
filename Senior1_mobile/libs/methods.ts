import { API } from "./api";

export interface RequestOptions {
  endpoint: string;
  id?: number | string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | 'PATCH';
  data?: any;
  params?: any;
  formData?: boolean;
  feature?: string;
  secondeMethode?: "PATCH"
}

export const APIService = {
  async request(options: RequestOptions) {
    let url = options.endpoint;
    if (options.id) url += `/${options.id}`;

    let method = options.method;

    if (options.method) {
      method = options.method;
    } else if (options.id && options.data) {
      method = "PUT";
    } else if (options.data) {
      method = "POST";
    } else if (options.data && options.secondeMethode ) {
      method = "PATCH";
    } else {
      method = "GET";
    }

    let payload = options.data;

    if (options.formData && options.data) {
      const fd = new FormData();
    
      Object.keys(options.data).forEach((key) => {
        const value = options.data[key];
    
        if (
          value &&
          typeof value === "object" &&
          value.uri
        ) {
          fd.append(key, {
            uri: value.uri,
            name: value.fileName || `${key}.jpg`,
            type: value.type || "image/jpeg",
          } as any);
        }
    
        else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (item?.uri) {
              fd.append(key, {
                uri: item.uri,
                name: item.fileName || `${key}_${index}.jpg`,
                type: item.type || "image/jpeg",
              } as any);
            } else {
              fd.append(`${key}[${index}]`, item);
            }
          });
        }
 
        else {
          fd.append(key, value);
        }
      });
    
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
    
    return res.data;
  },
};