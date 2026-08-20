import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/hooks/use-cart";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
};

export type Order = {
  id: string;
  status: string;
  total: number;
  full_name: string;
  phone: string;
  address: string;
  note: string;
  created_at: string;
  order_items: OrderItem[];
};

export const orderStatusLabel: Record<string, string> = {
  pending: "در انتظار تایید",
  confirmed: "تایید شده",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

export const myOrdersQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["orders", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total, full_name, phone, address, note, created_at, order_items(id, name, price, quantity, image_url)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });

export async function createOrder(input: {
  userId: string;
  items: CartItem[];
  total: number;
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}) {
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId,
      total: input.total,
      full_name: input.fullName,
      phone: input.phone,
      address: input.address,
      note: input.note ?? "",
    })
    .select("id")
    .single();
  if (error) throw error;

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image_url: item.image_url,
    })),
  );
  if (itemsError) throw itemsError;
  return order.id as string;
}
