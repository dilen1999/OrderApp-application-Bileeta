export interface Customer {
  code: string;
  name: string;
}

export interface Product {
  code: string;
  name: string;
  unitPrice: number;
}

export interface OrderItem {
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface Order {
  orderId: number;
  customerCode: string;
  items: OrderItem[];
  taxRate: number;
}

export const customers: Customer[] = [
  { code: "C001", name: "John Smith" },
  { code: "C002", name: "Jane Doe" },
  { code: "C003", name: "Acme Corporation" },
  { code: "C004", name: "Global Industries" },
  { code: "C005", name: "Tech Solutions Ltd" },
];

export const products: Product[] = [
  { code: "P001", name: "Laptop", unitPrice: 1200.00 },
  { code: "P002", name: "Mouse", unitPrice: 25.00 },
  { code: "P003", name: "Keyboard", unitPrice: 75.00 },
  { code: "P004", name: "Monitor", unitPrice: 450.00 },
  { code: "P005", name: "Headset", unitPrice: 150.00 },
  { code: "P006", name: "Webcam", unitPrice: 85.00 },
];

export const getCustomerByCode = (code: string): Customer | undefined =>
  customers.find((c) => c.code.toLowerCase() === code.toLowerCase());

export const getProductByCode = (code: string): Product | undefined =>
  products.find((p) => p.code.toLowerCase() === code.toLowerCase());

// Calculate line total
export const calcLineTotal = (item: OrderItem): number =>
  item.quantity * item.unitPrice - item.discount;

// Calculate sub total (sum of qty * unitPrice, before discounts)
export const calcSubTotal = (items: OrderItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

// Calculate discount total
export const calcDiscountTotal = (items: OrderItem[]): number =>
  items.reduce((sum, item) => sum + item.discount, 0);

// Calculate grand total
export const calcGrandTotal = (items: OrderItem[], taxRate: number): number => {
  const subTotal = calcSubTotal(items);
  const discountTotal = calcDiscountTotal(items);
  const afterDiscount = subTotal - discountTotal;
  return afterDiscount + afterDiscount * (taxRate / 100);
};
