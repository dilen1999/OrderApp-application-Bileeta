import { useState, useCallback } from "react";
import type { Order } from "@/data/masterData";

let nextOrderId = 1001;
const ordersDB: Map<number, Order> = new Map();

export const useOrderStore = () => {
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);

  const saveOrder = useCallback((order: Order): Order => {
    let saved: Order;
    if (order.orderId === 0) {
      saved = { ...order, orderId: nextOrderId++ };
    } else {
      saved = { ...order };
    }
    ordersDB.set(saved.orderId, JSON.parse(JSON.stringify(saved)));
    rerender();
    return saved;
  }, []);

  const getOrder = useCallback((id: number): Order | undefined => {
    const o = ordersDB.get(id);
    return o ? JSON.parse(JSON.stringify(o)) : undefined;
  }, []);

  const deleteOrder = useCallback((id: number): boolean => {
    const result = ordersDB.delete(id);
    rerender();
    return result;
  }, []);

  return { saveOrder, getOrder, deleteOrder };
};
