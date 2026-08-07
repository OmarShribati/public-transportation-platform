import { BaseService } from "@/lib/baseServices";

export const PassengersService = new BaseService("/admin/accounts/passenger", "auth");
export const PassengerPaymentsService = new BaseService("/payment/cards/", "auth");
export const PassengerUpdatePaymentsService = new BaseService("/payment/cards", "auth");
export const PassengerViewPaymentsService = new BaseService("/payment/passengers", "auth");

export const PassengerAPI = {
  activate: (p_id: number | string) => {
    return PassengersService.postWithId(p_id, "/activate", {});
  },
  deactivate: (p_id: number | string) => {
    return PassengersService.postWithId(p_id, "/deactivate", {});
  },
  update: (data:object , id:number | string) => PassengersService.update(id, data),
  createCard: (data:object) => PassengerPaymentsService.create(data),
  viewCard: (id:number | string) => PassengerViewPaymentsService.get(`${id}/card/`),
   updateCardStatus: (c_id: number | string, newStatus: string) => { return PassengerUpdatePaymentsService.patchWithId(c_id, "/status/", { status: newStatus });
}


};
