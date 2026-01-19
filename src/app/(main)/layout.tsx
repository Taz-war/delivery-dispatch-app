import { AppLayout } from "@/components/layout/AppLayout";
import { DataProvider } from "@/components/providers/DataProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <DataProvider>
                <AppLayout>{children}</AppLayout>
            </DataProvider>
        </ProtectedRoute>
    );
}
