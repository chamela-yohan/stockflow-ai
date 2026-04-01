import prisma from "@/lib/prisma";


export async function getStockPredictions(productId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Fetch sales for the last 30 days
  const sales = await prisma.sale.findMany({
    where: {
      productId,
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  const totalSold = sales.reduce((sum, s) => sum + s.quantity, 0);
  const dailyBurnRate = totalSold / 30;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { quantity: true, minThreshold: true },
  });

  if (!product || dailyBurnRate === 0) return null;

  // 2. Calculate days remaining
  const daysRemaining = Math.floor(product.quantity / dailyBurnRate);
  
  return {
    dailyBurnRate: dailyBurnRate.toFixed(2),
    daysRemaining,
    isUrgent: daysRemaining <= 7 || product.quantity <= product.minThreshold,
  };
}