import { BaseService } from "@/lib/baseServices";

export const TransactionsService = new BaseService("/payment/subscription-transactions/", "transactions");

export const TransactionsAPI = {
  list: () => TransactionsService.list(),

};
