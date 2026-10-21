import { NextResponse } from "next/server";
import { getProfile, getUser } from "@/lib/auth/user";
import { getCustomerOverview } from "@/lib/customer/data";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const [profile, overview] = await Promise.all([getProfile(), getCustomerOverview()]);
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), account: { id: user.id, email: user.email, createdAt: user.created_at }, profile, orders: overview.orders, digitalAccess: overview.access, subscriptions: overview.subscriptions, readingProgress: overview.progress }, null, 2);
  return new NextResponse(body, { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="movehaus-meus-dados-${new Date().toISOString().slice(0, 10)}.json"`, "cache-control": "no-store" } });
}
