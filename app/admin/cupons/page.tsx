import { CouponsAdmin } from "@/components/admin/CouponsAdmin";
import { requireAdmin } from "@/lib/admin-server";
import { listCouponsForAdmin } from "@/lib/supabase/coupons";

export default async function AdminCuponsPage() {
  await requireAdmin("/admin/cupons");

  const coupons = await listCouponsForAdmin();

  return <CouponsAdmin initialCoupons={coupons ?? []} />;
}
