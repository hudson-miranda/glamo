
import { PrismaClient } from '@prisma/client';

export async function processExpiredCashback(args: any, context: any) {
  const prisma: PrismaClient = context.entities;

  console.log('Starting expired cashback processing...');

  try {
    const now = new Date();

    // Find expired transactions
    const expiredTransactions = await prisma.loyaltyTransaction.findMany({
      where: {
        type: 'EARNED',
        expiresAt: {
          lte: now
        },
        expiredAt: null
      },
      include: {
        balance: true,
        client: true
      }
    });

    console.log(`Found ${expiredTransactions.length} expired cashback transactions`);

    for (const transaction of expiredTransactions) {
      // Update balance
      await prisma.clientLoyaltyBalance.update({
        where: { id: transaction.balanceId },
        data: {
          availableBalance: {
            decrement: transaction.amount
          }
        }
      });

      // Mark transaction as expired
      await prisma.loyaltyTransaction.update({
        where: { id: transaction.id },
        data: {
          expiredAt: now
        }
      });

      // Create expiry transaction record
      await prisma.loyaltyTransaction.create({
        data: {
          balanceId: transaction.balanceId,
          programId: transaction.programId,
          salonId: transaction.salonId,
          clientId: transaction.clientId,
          type: 'EXPIRED',
          amount: -transaction.amount,
          balanceAfter: transaction.balance.availableBalance - transaction.amount,
          description: `Cashback expired (originally earned on ${transaction.createdAt.toLocaleDateString()})`
        }
      });

      console.log(`Expired ${transaction.amount} cashback for client ${transaction.client.name}`);
    }

    console.log('Expired cashback processing completed');
    return { processed: expiredTransactions.length };
  } catch (error) {
    console.error('Error processing expired cashback:', error);
    throw error;
  }
}
