import { api } from "@/lib/api";
import type { OrderRequestDto, OrderResponseDto } from "@/types/order";

export async function getOrder(orderId: number) {
  return api.get<OrderResponseDto>(`/api/orders/${orderId}`);
}

export async function createOrder(payload: OrderRequestDto) {
  return api.post<OrderResponseDto>(`/api/orders`, payload);
}

export async function updateOrder(orderId: number, payload: OrderRequestDto) {
  return api.put<OrderResponseDto>(`/api/orders/${orderId}`, payload);
}

export async function deleteOrder(orderId: number) {
  return api.del<void>(`/api/orders/${orderId}`);
}