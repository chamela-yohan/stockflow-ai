import prisma from "@/lib/prisma";
import ChatInterface from "./components/ChatInterface";
import { getStockPredictions } from "./lib/predictions";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default async function DashboardPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });

  const user = await currentUser();

  // Check if user has 'admin' role in their metadata
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <div className="min-h-screen p-8 bg-brand-bg text-brand-dark">
      <header className="mb-10 flex justify-between items-end p-2 ">
        <div>
          <h1 className="font-bold text-2xl">Inventory Overview</h1>
        </div>
        <div className="">
          <h2 className="">
            Total Items: {products.length}
          </h2>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map(async (item) => {
          const prediction = await getStockPredictions(item.id);
          return (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mt-4 flex items-center justify-between">
                {isAdmin && prediction?.isUrgent && (
                  <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    ⚠️ Restock in ~{prediction.daysRemaining} days
                  </span>
                )}
              </div>

              {isAdmin && prediction && (
                <p className="mt-4 text-xs text-brand-primary/60 italic">
                  Burn rate: {prediction.dailyBurnRate} units/day based on
                  30-day trend.
                </p>
              )}

              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{item.name}</h3>
                <span className="text-brand-primary font-mono font-bold">
                  ${Number(item.price).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 bg-brand-bg h-3 rounded-full overflow-hidden shadow shadow-gray-200">
                  <div
                    className={`h-full transition-all ${item.quantity <= item.minThreshold ? "bg-red-500" : "bg-amber-600"}`}
                    style={{
                      width: `${Math.min((item.quantity / item.minThreshold) * 50, 100)}%`,
                    }}
                  />
                </div>
                <span
                  className={`font-bold ${item.quantity <= item.minThreshold ? "text-red-600" : "text-brand-dark"}`}
                >
                  {item.quantity} units
                </span>
              </div>

              {item.quantity <= item.minThreshold && (
                <p className="mt-4 text-xs font-bold text-red-500 uppercase tracking-tighter">
                  ⚠️ Low Stock - Reorder Suggested
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Only render Chat for Admins */}
      {isAdmin && <ChatInterface />}
    </div>
  );
}
