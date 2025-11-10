
import { PrismaClient } from '@prisma/client';

export async function checkTierUpgrades(args: any, context: any) {
  const prisma: PrismaClient = context.entities;

  console.log('Starting tier upgrade check...');

  try {
    // Get all loyalty programs with tiers enabled
    const programs = await prisma.loyaltyProgram.findMany({
      where: {
        isActive: true,
        vipTiersEnabled: true,
        deletedAt: null
      },
      include: {
        tiers: {
          orderBy: { order: 'asc' }
        },
        balances: {
          include: {
            client: true,
            tier: true
          }
        }
      }
    });

    console.log(`Checking ${programs.length} programs for tier upgrades`);

    let upgradeCount = 0;

    for (const program of programs) {
      if (program.tiers.length === 0) continue;

      for (const balance of program.balances) {
        // Find eligible tier
        const eligibleTier = program.tiers
          .filter(tier => {
            const meetsSpent = !tier.minTotalSpent || balance.totalSpent >= tier.minTotalSpent;
            const meetsVisits = !tier.minVisits || balance.totalVisits >= tier.minVisits;
            const meetsMonthly = !tier.minMonthlySpent || (balance.totalSpent / Math.max(1, balance.totalVisits)) >= tier.minMonthlySpent;
            return meetsSpent && meetsVisits && meetsMonthly;
          })
          .sort((a, b) => (b.minTotalSpent || 0) - (a.minTotalSpent || 0))[0];

        // Check if needs upgrade
        if (eligibleTier && eligibleTier.id !== balance.currentTierId) {
          await prisma.clientLoyaltyBalance.update({
            where: { id: balance.id },
            data: {
              currentTierId: eligibleTier.id,
              tierAchievedAt: new Date()
            }
          });

          // Award tier bonus if applicable
          if (eligibleTier.cashbackMultiplier > 1.0) {
            const bonusAmount = 50; // Fixed bonus for tier upgrade
            await prisma.clientLoyaltyBalance.update({
              where: { id: balance.id },
              data: {
                availableBalance: {
                  increment: bonusAmount
                },
                lifetimeEarned: {
                  increment: bonusAmount
                }
              }
            });

            await prisma.loyaltyTransaction.create({
              data: {
                balanceId: balance.id,
                programId: program.id,
                salonId: balance.salonId,
                clientId: balance.clientId,
                type: 'TIER_BONUS',
                amount: bonusAmount,
                balanceAfter: balance.availableBalance + bonusAmount,
                description: `Tier upgrade bonus - Welcome to ${eligibleTier.name}`
              }
            });
          }

          console.log(`Upgraded ${balance.client.name} to ${eligibleTier.name}`);
          upgradeCount++;
        }
      }
    }

    console.log(`Tier upgrade check completed. ${upgradeCount} upgrades processed`);
    return { upgrades: upgradeCount };
  } catch (error) {
    console.error('Error checking tier upgrades:', error);
    throw error;
  }
}
