import { useState, useMemo } from "react";
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
import { useOrderStore } from "@/hooks/useOrderStore";
import {
  getCustomerByCode,
  getProductByCode,
  calcLineTotal,
  calcSubTotal,
  calcDiscountTotal,
  calcGrandTotal,
  type OrderItem,
} from "@/data/masterData";
import { Plus, Trash2, Save, Search, FilePlus, FileX } from "lucide-react";
import { toast } from "sonner";

const emptyItem = (): OrderItem => ({
  productCode: "",
  quantity: 0,
  unitPrice: 0,
  discount: 0,
});

const OrderForm = () => {
  const { saveOrder, getOrder, deleteOrder } = useOrderStore();

  const [orderId, setOrderId] = useState(0);
  const [orderIdInput, setOrderIdInput] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [items, setItems] = useState<OrderItem[]>([emptyItem()]);
  const [taxRate, setTaxRate] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const customerName = useMemo(() => {
    const c = getCustomerByCode(customerCode);
    return c?.name ?? "";
  }, [customerCode]);

  const subTotal = useMemo(() => calcSubTotal(items), [items]);
  const discountTotal = useMemo(() => calcDiscountTotal(items), [items]);
  const grandTotal = useMemo(() => calcGrandTotal(items, taxRate), [items, taxRate]);

  const updateItem = (index: number, field: keyof OrderItem, value: string) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "productCode") {
        item.productCode = value;
        const product = getProductByCode(value);
        if (product) {
          item.unitPrice = product.unitPrice;
        }
      } else if (field === "quantity" || field === "unitPrice" || field === "discount") {
        (item as any)[field] = parseFloat(value) || 0;
      }

      updated[index] = item;
      return updated;
    });
    setIsSaved(false);
  };

  const addRow = () => {
    setItems((prev) => [...prev, emptyItem()]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
    setIsSaved(false);
  };

  const resetForm = () => {
    setOrderId(0);
    setOrderIdInput("");
    setCustomerCode("");
    setItems([emptyItem()]);
    setTaxRate(0);
    setIsSaved(false);
  };

  const handleLoadOrder = () => {
    const id = parseInt(orderIdInput);
    if (isNaN(id)) {
      toast.error("Please enter a valid Order ID");
      return;
    }
    const order = getOrder(id);
    if (!order) {
      toast.error(`Order #${id} not found`);
      return;
    }
    setOrderId(order.orderId);
    setCustomerCode(order.customerCode);
    setItems(order.items.length > 0 ? order.items : [emptyItem()]);
    setTaxRate(order.taxRate);
    setIsSaved(true);
    toast.success(`Order #${order.orderId} loaded`);
  };

  const handleSave = () => {
    if (!customerCode.trim()) {
      toast.error("Please enter a Customer Code");
      return;
    }
    if (!getCustomerByCode(customerCode)) {
      toast.error("Invalid Customer Code");
      return;
    }
    const validItems = items.filter((i) => i.productCode.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const saved = saveOrder({
      orderId,
      customerCode,
      items: validItems,
      taxRate,
    });
    setOrderId(saved.orderId);
    setOrderIdInput(String(saved.orderId));
    setIsSaved(true);
    toast.success(`Order #${saved.orderId} saved successfully`);
  };

  const handleDelete = () => {
    if (orderId === 0) {
      toast.error("No saved order to delete");
      return;
    }
    deleteOrder(orderId);
    toast.success(`Order #${orderId} deleted`);
    resetForm();
  };

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-primary/5">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Customer Order
            </CardTitle>
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
                  <Button variant="outline" size="icon" onClick={handleLoadOrder} title="Load Order">
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
                    />
                    <span className="text-sm text-muted-foreground italic">
                      {customerName || "Customer name will display here"}
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
                <Button variant="ghost" size="sm" onClick={addRow} className="gap-1.5 text-primary">
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderForm;
