import { APIService } from "./methods";

export class BaseService {
  constructor(private endpoint: string, private feature: string) {}

  list(params?: any, data?: any) {    
    return APIService.request({
      endpoint: this.endpoint,
      method: "GET",
      params,
      data,
      feature: this.feature,
    });
  }

  get(id: number | string,params?: any) {
    return APIService.request({
      endpoint: this.endpoint,
      id,
      params,
      method: "GET",
      feature: this.feature,
    });
  }

  create(data: any, formData = false) {
    return APIService.request({
      endpoint: this.endpoint,
      data,
      formData,
      feature: this.feature,
    });
  }

  update(id: number | string, data: any, formData = false) {
    return APIService.request({
      endpoint: this.endpoint,
      id,
      data,
      formData,
      feature: this.feature,
    });
  }

  delete(id: number | string) {
    return APIService.request({
      endpoint: this.endpoint,
      id,
      method: "DELETE",
      feature: this.feature,
    });
  }
}
