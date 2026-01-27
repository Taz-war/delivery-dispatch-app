import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

export type Customer = Tables<"customers">;

export const useCustomers = () => {
    return useQuery({
        queryKey: ["customers"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("customers")
                .select("*")
                .order("name");

            if (error) throw error;
            return data;
        },
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (customer: TablesInsert<"customers">) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Auto-generate customer code if not provided
            let customerCode = customer.customer_code;
            if (!customerCode && customer.name) {
                customerCode = customer.name
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 4) + "-" + Math.floor(1000 + Math.random() * 9000);
            }

            const { data, error } = await supabase
                .from("customers")
                .insert({
                    ...customer,
                    customer_code: customerCode,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            // Invalidate the search query specifically used in CustomerSearch
            queryClient.invalidateQueries({ queryKey: ["customers-search"] });

            toast({
                title: "Customer Created",
                description: `${data.name} has been added to customers.`,
            });
        },
        onError: (error) => {
            console.error("Error creating customer:", error);
            toast({
                title: "Error",
                description: "Failed to create customer. Please try again.",
                variant: "destructive",
            });
        }
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<"customers"> }) => {
            const { data, error } = await supabase
                .from("customers")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            queryClient.invalidateQueries({ queryKey: ["customers-search"] });

            toast({
                title: "Customer Updated",
                description: `${data.name} has been updated.`,
            });
        },
        onError: (error) => {
            console.error("Error updating customer:", error);
            toast({
                title: "Error",
                description: "Failed to update customer. Please try again.",
                variant: "destructive",
            });
        }
    });
};
