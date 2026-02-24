import { api } from "@/lib/api";

export type CustomerDto = { customerCode: string; customerName: string };

export async function getCustomerByCode(code: string) {
  return api.get<CustomerDto>(`/api/customers/${code}`);
}

export async function getAllCustomers() {
  return api.get<CustomerDto[]>(`/api/customers`);
}