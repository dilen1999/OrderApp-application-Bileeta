// src/components/OrderForm.tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Save, Search, FilePlus, FileX } from "lucide-react";
import { toast } from "sonner";

import type { OrderItemDto, OrderRequestDto, OrderResponseDto } from "@/types/order";
import { createOrder, updateOrder, deleteOrder } from "@/lib/orderApi";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

const emptyItem = (): OrderItemDto => ({
  productCode: "",
  quantity: 0,
  unitPrice: 0,
  discount: 0,
});

const calcLineTotal = (i: OrderItemDto) =>
  (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0) - (Number(i.discount) || 0);

const calcSubTotal = (items: OrderItemDto[]) =>
  items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);

const calcDiscountTotal = (items: OrderItemDto[]) =>
  items.reduce((sum, i) => sum + (Number(i.discount) || 0), 0);

const calcGrandTotal = (items: OrderItemDto[], taxRate: number) => {
  const sub = calcSubTotal(items);
  const disc = calcDiscountTotal(items);
  const net = sub - disc;
  const tax = net * ((Number(taxRate) || 0) / 100);
  return net + tax;
};

const OrderForm = () => {
  const [orderId, setOrderId] = useState(0);
  const [orderIdInput, setOrderIdInput] = useState("");

  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [items, setItems] = useState<OrderItemDto[]>([emptyItem()]);
  const [taxRate, setTaxRate] = useState(0);

  const [isSaved, setIsSaved] = useState(false);

  // cache indicators (from backend headers)
  const [orderCacheHeader, setOrderCacheHeader] = useState<string>("");
  const [customerCacheHeader, setCustomerCacheHeader] = useState<string>("");

  const validItems = useMemo(
    () => items.filter((i) => i.productCode.trim() !== ""),
    [items]
  );

  // UI computed totals (instant feedback). Backend also calculates on save/load.
  const subTotal = useMemo(() => calcSubTotal(items), [items]);
  const discountTotal = useMemo(() => calcDiscountTotal(items), [items]);
  const grandTotal = useMemo(() => calcGrandTotal(items, taxRate), [items, taxRate]);

  const fmt = (n: number) =>
    (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const updateItem = (index: number, field: keyof OrderItemDto, value: string) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "productCode") {
        item.productCode = value;
      } else if (field === "quantity" || field === "unitPrice" || field === "discount") {
        (item as any)[field] = parseFloat(value) || 0;
      }

      updated[index] = item;
      return updated;
    });
    setIsSaved(false);
  };

  const addRow = () => setItems((prev) => [...prev, emptyItem()]);

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    setIsSaved(false);
  };

  const resetForm = () => {
    setOrderId(0);
    setOrderIdInput("");
    setCustomerCode("");
    setCustomerName("");
    setItems([emptyItem()]);
    setTaxRate(0);
    setIsSaved(false);
    setOrderCacheHeader("");
    setCustomerCacheHeader("");
  };

  // ---- API calls ----

  const loadCustomerName = async (code: string) => {
    const c = code.trim();
    if (!c) {
      setCustomerName("");
      setCustomerCacheHeader("");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/customers/${encodeURIComponent(c)}`);
      setCustomerCacheHeader(res.headers.get("X-Cache") || "");
      if (!res.ok) {
        setCustomerName("");
        return;
      }
      const data = (await res.json()) as { customerCode: string; customerName: string };
      setCustomerName(data.customerName ?? "");
    } catch {
      setCustomerName("");
      setCustomerCacheHeader("");
    }
  };

  const handleLoadOrder = async () => {
    const id = parseInt(orderIdInput);
    if (isNaN(id)) {
      toast.error("Please enter a valid Order ID");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`);
      setOrderCacheHeader(res.headers.get("X-Cache") || "");

      if (!res.ok) {
        toast.error(`Order #${id} not found`);
        return;
      }

      const order = (await res.json()) as OrderResponseDto;

      setOrderId(order.orderId);
      setOrderIdInput(String(order.orderId));
      setCustomerCode(order.customerCode);
      setCustomerName(order.customerName ?? "");
      setItems(order.items?.length ? order.items : [emptyItem()]);
      setTaxRate(order.taxRate ?? 0);
      setIsSaved(true);

      toast.success(`Order #${order.orderId} loaded${orderCacheHeader ? ` (${orderCacheHeader})` : ""}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load order");
    }
  };

  const handleSave = async () => {
    try {
      if (!customerCode.trim()) {
        toast.error("Please enter a Customer Code");
        return;
      }

      if (validItems.length === 0) {
        toast.error("Please add at least one product");
        return;
      }

      // Basic item validation (frontend)
      for (const it of validItems) {
        const gross = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
        if (!it.productCode.trim()) return toast.error("Product code is required");
        if ((Number(it.quantity) || 0) <= 0) return toast.error("Quantity must be > 0");
        if ((Number(it.unitPrice) || 0) < 0) return toast.error("Unit price cannot be negative");
        if ((Number(it.discount) || 0) < 0) return toast.error("Discount cannot be negative");
        if ((Number(it.discount) || 0) > gross) return toast.error("Discount cannot exceed line amount");
      }

      const payload: OrderRequestDto = {
        customerCode: customerCode.trim(),
        taxRate: Number(taxRate) || 0,
        items: validItems.map((i) => ({
          productCode: i.productCode.trim(),
          quantity: Number(i.quantity) || 0,
          unitPrice: Number(i.unitPrice) || 0,
          discount: Number(i.discount) || 0,
        })),
      };

      let saved: OrderResponseDto;
      if (orderId === 0) {
        saved = await createOrder(payload);
      } else {
        saved = await updateOrder(orderId, payload);
      }

      // update UI from server response (source of truth)
      setOrderId(saved.orderId);
      setOrderIdInput(String(saved.orderId));
      setCustomerCode(saved.customerCode);
      setCustomerName(saved.customerName ?? "");
      setItems(saved.items?.length ? saved.items : [emptyItem()]);
      setTaxRate(saved.taxRate ?? 0);

      setIsSaved(true);
      toast.success(`Order #${saved.orderId} saved successfully`);
    } catch (e: any) {
      // Your backend might return plain text or JSON; this keeps it simple
      toast.error(e?.message || "Save failed");
    }
  };

  const handleDelete = async () => {
    if (orderId === 0) {
      toast.error("No saved order to delete");
      return;
    }

    try {
      await deleteOrder(orderId);
      toast.success(`Order #${orderId} deleted`);
      resetForm();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  // auto-load customer name when user leaves field OR presses Enter
  useEffect(() => {
    // optional: if user cleared code, clear name immediately
    if (!customerCode.trim()) {
      setCustomerName("");
      setCustomerCacheHeader("");
    }
  }, [customerCode]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-primary/5">
            <CardTitle className="text-2xl font-bold tracking-tight">Customer Order</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Order ID & Customer */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                      id="orderId"
                      placeholder="Enter Order ID to load"
                      value={orderIdInput}
                      onChange={(e) => setOrderIdInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLoadOrder()}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLoadOrder}
                    title="Load Order"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="customerCode">Customer Code</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="customerCode"
                      className="max-w-[200px]"
                      placeholder="e.g. C001"
                      value={customerCode}
                      onChange={(e) => {
                        setCustomerCode(e.target.value);
                        setIsSaved(false);
                      }}
                      onBlur={() => loadCustomerName(customerCode)}
                      onKeyDown={(e) => e.key === "Enter" && loadCustomerName(customerCode)}
                    />

                    <span className="text-sm text-muted-foreground italic">
                      {customerName || "Customer name will display here"}
                      {customerCacheHeader ? (
                        <span className="ml-2 not-italic">| Cache: {customerCacheHeader}</span>
                      ) : null}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-end gap-2 pt-6">
                <Button onClick={resetForm} variant="outline" className="gap-1.5">
                  <FilePlus className="h-4 w-4" /> New
                </Button>
                <Button onClick={handleSave} className="gap-1.5">
                  <Save className="h-4 w-4" /> Save
                </Button>
                <Button onClick={handleDelete} variant="destructive" className="gap-1.5">
                  <FileX className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>

            {/* Product Detail Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[180px]">Product Code</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead className="w-[140px]">Unit Price</TableHead>
                    <TableHead className="w-[140px]">Discount</TableHead>
                    <TableHead className="w-[140px] text-right">Total</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.productCode}
                          placeholder="e.g. P001"
                          onChange={(e) => updateItem(index, "productCode", e.target.value)}
                          className="h-8"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={item.quantity || ""}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                          className="h-8"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.unitPrice || ""}
                          onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                          className="h-8"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={item.discount || ""}
                          onChange={(e) => updateItem(index, "discount", e.target.value)}
                          className="h-8"
                        />
                      </TableCell>

                      <TableCell className="text-right font-medium tabular-nums">
                        {fmt(calcLineTotal(item))}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeRow(index)}
                          disabled={items.length <= 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addRow}
                  className="gap-1.5 text-primary"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Sub Total</Label>
                  <span className="w-[140px] text-right font-medium tabular-nums">
                    {fmt(subTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Discount Total</Label>
                  <span className="w-[140px] text-right font-medium tabular-nums">
                    {fmt(discountTotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="taxRate" className="text-muted-foreground">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min={0}
                    step={0.01}
                    value={taxRate || ""}
                    onChange={(e) => {
                      setTaxRate(parseFloat(e.target.value) || 0);
                      setIsSaved(false);
                    }}
                    className="h-8 w-[140px] text-right"
                  />
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <Label className="text-base font-semibold">Grand Total</Label>
                  <span className="w-[140px] text-right text-lg font-bold tabular-nums text-primary">
                    {fmt(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            {orderId > 0 && (
              <div className="text-sm text-muted-foreground">
                Order #{orderId} {isSaved ? "— Saved" : "— Unsaved changes"}
                {orderCacheHeader ? <span className="ml-2">| Cache: {orderCacheHeader}</span> : null}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderForm;