
import { PrismaClient } from '@prisma/client';

export async function calculateDailyMetrics(args: any, context: any) {
  const prisma: PrismaClient = context.entities;

  console.log('Starting daily metrics calculation...');

  try {
    // Get all salons
    const salons = await prisma.salon.findMany({
      where: {
        deletedAt: null
      }
    });

    console.log(`Calculating metrics for ${salons.length} salons`);

    let calculatedCount = 0;

    for (const salon of salons) {
      // Get all clients for salon
      const clients = await prisma.client.findMany({
        where: {
          salonId: salon.id,
          deletedAt: null
        },
        include: {
          appointments: {
            where: {
              status: { in: ['DONE', 'CONFIRMED', 'IN_SERVICE'] }
            }
          },
          sales: {
            where: {
              status: 'PAID'
            }
          }
        }
      });

      // Calculate metrics for each client
      for (const client of clients) {
        const totalVisits = client.appointments.length;
        const totalSpent = client.sales.reduce((sum, sale) => sum + sale.finalTotal, 0);
        const avgTransactionValue = totalVisits > 0 ? totalSpent / totalVisits : 0;

        const completedAppointments = client.appointments.filter(a => a.status === 'DONE');
        const cancelledAppointments = client.appointments.filter(a => a.status === 'CANCELLED');
        const cancellationRate = client.appointments.length > 0
          ? (cancelledAppointments.length / client.appointments.length) * 100
          : 0;

        const lastVisit = completedAppointments.sort((a, b) => 
          b.startAt.getTime() - a.startAt.getTime()
        )[0];
        
        const daysSinceLastVisit = lastVisit
          ? Math.floor((Date.now() - lastVisit.startAt.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        // Calculate visit frequency
        let avgDaysBetweenVisits = 0;
        let visitFrequency = 0;

        if (completedAppointments.length > 1) {
          const sortedVisits = completedAppointments.sort((a, b) => 
            a.startAt.getTime() - b.startAt.getTime()
          );
          const firstVisit = sortedVisits[0];
          const daysSinceFirst = Math.floor(
            (Date.now() - firstVisit.startAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          visitFrequency = daysSinceFirst > 0 ? (completedAppointments.length / daysSinceFirst) * 30 : 0;
          avgDaysBetweenVisits = daysSinceFirst / (completedAppointments.length - 1);
        }

        const avgMonthlySpending = visitFrequency > 0 ? avgTransactionValue * visitFrequency : 0;

        // Calculate CLV
        const lifespan = totalVisits < 5 ? 1 : totalVisits < 12 ? 2 : 3;
        const predictedLTV = avgMonthlySpending * 12 * lifespan;

        // Calculate churn risk
        let churnRisk = 0;
        if (avgDaysBetweenVisits > 0) {
          const visitRatio = daysSinceLastVisit / avgDaysBetweenVisits;
          if (visitRatio > 2) churnRisk += 40;
          else if (visitRatio > 1.5) churnRisk += 25;
          else if (visitRatio > 1.2) churnRisk += 10;
        }
        churnRisk += (cancellationRate / 100) * 30;
        if (totalVisits < 3) churnRisk += 15;
        if (daysSinceLastVisit > 90) churnRisk += 25;
        else if (daysSinceLastVisit > 60) churnRisk += 15;
        churnRisk = Math.min(churnRisk, 100);

        // Determine retention status
        let retentionStatus: any = 'NEW';
        if (totalVisits === 1 && daysSinceLastVisit <= 30) retentionStatus = 'NEW';
        else if (daysSinceLastVisit <= 45) retentionStatus = 'ACTIVE';
        else if (daysSinceLastVisit <= 90) retentionStatus = 'AT_RISK';
        else if (daysSinceLastVisit <= 180) retentionStatus = 'DORMANT';
        else retentionStatus = 'CHURNED';

        const firstVisit = completedAppointments.sort((a, b) => 
          a.startAt.getTime() - b.startAt.getTime()
        )[0];
        
        const cohortMonth = firstVisit
          ? `${firstVisit.startAt.getFullYear()}-${String(firstVisit.startAt.getMonth() + 1).padStart(2, '0')}`
          : null;

        const monthsSinceFirstVisit = firstVisit
          ? Math.floor((Date.now() - firstVisit.startAt.getTime()) / (1000 * 60 * 60 * 24 * 30))
          : 0;

        const appointmentShowRate = client.appointments.length > 0
          ? ((client.appointments.length - cancelledAppointments.length) / client.appointments.length) * 100
          : 100;

        const loyaltyScore = Math.min(100, (totalVisits * 10) + (appointmentShowRate * 0.5));
        const satisfactionScore = appointmentShowRate > 90 ? 9 : appointmentShowRate > 80 ? 8 : 7;

        const isVIP = totalSpent > 5000 || totalVisits > 20;
        const isAtRisk = churnRisk > 60 || retentionStatus === 'AT_RISK';
        const needsAttention = isAtRisk || retentionStatus === 'DORMANT';

        // Upsert metrics
        await prisma.clientMetrics.upsert({
          where: {
            clientId: client.id
          },
          create: {
            clientId: client.id,
            salonId: salon.id,
            lifetimeValue: totalSpent,
            predictedLTV,
            avgTransactionValue,
            totalVisits,
            visitFrequency,
            daysSinceLastVisit,
            avgDaysBetweenVisits,
            totalSpent,
            avgMonthlySpending,
            lastPurchaseAmount: client.sales[0]?.finalTotal || 0,
            appointmentShowRate,
            cancellationRate,
            rescheduleRate: 0,
            retentionStatus,
            churnRisk,
            cohortMonth,
            monthsSinceFirstVisit,
            preferredServices: [],
            satisfactionScore,
            loyaltyScore,
            referralScore: loyaltyScore > 80 ? 85 : 60,
            isVIP,
            isAtRisk,
            needsAttention,
            lastCalculatedAt: new Date()
          },
          update: {
            lifetimeValue: totalSpent,
            predictedLTV,
            avgTransactionValue,
            totalVisits,
            visitFrequency,
            daysSinceLastVisit,
            avgDaysBetweenVisits,
            totalSpent,
            avgMonthlySpending,
            lastPurchaseAmount: client.sales[0]?.finalTotal || 0,
            appointmentShowRate,
            cancellationRate,
            retentionStatus,
            churnRisk,
            cohortMonth,
            monthsSinceFirstVisit,
            satisfactionScore,
            loyaltyScore,
            referralScore: loyaltyScore > 80 ? 85 : 60,
            isVIP,
            isAtRisk,
            needsAttention,
            lastCalculatedAt: new Date()
          }
        });

        calculatedCount++;
      }

      // Update salon-level analytics
      const [
        totalClients,
        activeClients,
        newClients,
        churnedClients,
        appointments,
        sales
      ] = await Promise.all([
        prisma.client.count({ where: { salonId: salon.id, deletedAt: null } }),
        prisma.clientMetrics.count({ where: { salonId: salon.id, retentionStatus: 'ACTIVE' } }),
        prisma.clientMetrics.count({ where: { salonId: salon.id, retentionStatus: 'NEW' } }),
        prisma.clientMetrics.count({ where: { salonId: salon.id, retentionStatus: 'CHURNED' } }),
        prisma.appointment.findMany({ where: { salonId: salon.id } }),
        prisma.sale.findMany({ where: { salonId: salon.id, status: 'PAID' } })
      ]);

      const totalRevenue = sales.reduce((sum, sale) => sum + sale.finalTotal, 0);
      const avgTransactionValue = sales.length > 0 ? totalRevenue / sales.length : 0;

      const completedAppointments = appointments.filter(a => a.status === 'DONE').length;
      const cancelledAppointments = appointments.filter(a => a.status === 'CANCELLED').length;
      const noShowAppointments = appointments.filter(a => a.isNoShow).length;

      const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0;
      const churnRate = totalClients > 0 ? (churnedClients / totalClients) * 100 : 0;

      const avgCLV = await prisma.clientMetrics.aggregate({
        where: { salonId: salon.id },
        _avg: { lifetimeValue: true }
      });

      await prisma.salonAnalytics.upsert({
        where: {
          salonId_date_period: {
            salonId: salon.id,
            date: new Date(),
            period: 'DAILY'
          }
        },
        create: {
          salonId: salon.id,
          date: new Date(),
          period: 'DAILY',
          totalClients,
          activeClients,
          newClients,
          churnedClients,
          reactivatedClients: 0,
          totalRevenue,
          avgTransactionValue,
          avgClientLTV: avgCLV._avg.lifetimeValue || 0,
          totalAppointments: appointments.length,
          completedAppointments,
          cancelledAppointments,
          noShowAppointments,
          retentionRate,
          churnRate,
          repeatClientRate: 0
        },
        update: {
          totalClients,
          activeClients,
          newClients,
          churnedClients,
          totalRevenue,
          avgTransactionValue,
          avgClientLTV: avgCLV._avg.lifetimeValue || 0,
          totalAppointments: appointments.length,
          completedAppointments,
          cancelledAppointments,
          noShowAppointments,
          retentionRate,
          churnRate
        }
      });
    }

    console.log(`Daily metrics calculation completed. ${calculatedCount} client metrics calculated`);
    return { calculated: calculatedCount };
  } catch (error) {
    console.error('Error calculating daily metrics:', error);
    throw error;
  }
}
