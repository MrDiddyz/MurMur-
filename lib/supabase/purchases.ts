type SupabasePurchaseQuery = {
  from: (table: "purchases") => {
    select: (columns: "products(*)") => {
      eq: (
        column: "user_id",
        value: string,
      ) => Promise<{ data: unknown[] | null; error: Error | null }>;
    };
  };
};

export async function getUserPurchasedProducts(
  supabase: SupabasePurchaseQuery,
  user: { id: string },
) {
  const { data, error } = await supabase
    .from("purchases")
    .select("products(*)")
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  return data ?? [];
}
