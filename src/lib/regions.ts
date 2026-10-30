import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Region = Tables<"regions">;
export const GRID_W = 20;
export const GRID_H = 12;

export const regionsQuery = queryOptions({
  queryKey: ["regions"],
  queryFn: async () => {
    const { data, error } = await supabase.from("regions").select("*").order("id");
    if (error) throw error;
    return data as Region[];
  },
});

export const STATUS_LABEL: Record<string, string> = {
  available: "متاحة",
  reserved: "محجوزة",
  unavailable: "غير متاحة",
};

export function claimErrorMessage(msg: string) {
  if (msg.includes("already_has_region")) return "لديك منطقة بداية محجوزة بالفعل";
  if (msg.includes("region_not_available")) return "هذه المنطقة لم تعد متاحة";
  return msg;
}
