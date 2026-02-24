export type OrderItemDto = {
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal?: number; // response only
};

export type OrderRequestDto = {
  customerCode: string;
  taxRate: number;
  items: OrderItemDto[];
};

export type OrderResponseDto = {
  orderId: number;
  customerCode: string;
  customerName?: string;
  taxRate: number;
  subTotal: number;
  discountTotal: number;
  grandTotal: number;
  items: OrderItemDto[];
};