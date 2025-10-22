import { type User } from 'wasp/entities';
import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@prisma/client';
import { getSubscriptionPaymentPlanIds, SubscriptionStatus } from '../../payment/plans';

type MockUserData = Omit<User, 'id'>;

/**
 * This function, which we've imported in `app.db.seeds` in the `main.wasp` file,
 * seeds the database with mock users via the `wasp db seed` command.
 * For more info see: https://wasp.sh/docs/data-model/backends#seeding-the-database
 */
export async function seedMockUsers(prismaClient: PrismaClient) {
  await Promise.all(generateMockUsersData(50).map((data) => prismaClient.user.create({ data })));
}

function generateMockUsersData(numOfUsers: number): MockUserData[] {
  return faker.helpers.multiple(generateMockUserData, { count: numOfUsers });
}

function generateMockUserData(): MockUserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const subscriptionStatus = faker.helpers.arrayElement<SubscriptionStatus | null>([
    ...Object.values(SubscriptionStatus),
    null,
  ]);
  const now = new Date();
  const createdAt = faker.date.past({ refDate: now });
  const timePaid = faker.date.between({ from: createdAt, to: now });
  const credits = subscriptionStatus ? 0 : faker.number.int({ min: 0, max: 10 });
  const hasUserPaidOnStripe = !!subscriptionStatus || credits > 3;
  return {
    email: faker.internet.email({ firstName, lastName }),
    username: faker.internet.userName({ firstName, lastName }),
    createdAt,
    updatedAt: createdAt,
    isAdmin: false,
    credits,
    subscriptionStatus,
    lemonSqueezyCustomerPortalUrl: null,
    paymentProcessorUserId: hasUserPaidOnStripe ? `cus_test_${faker.string.uuid()}` : null,
    datePaid: hasUserPaidOnStripe ? faker.date.between({ from: createdAt, to: timePaid }) : null,
    subscriptionPlan: subscriptionStatus ? faker.helpers.arrayElement(getSubscriptionPaymentPlanIds()) : null,
    // Glamo-specific fields
    name: faker.person.fullName({ firstName, lastName }),
    phone: faker.phone.number(),
    phone2: null,
    phoneType: 'MOBILE',
    phoneType2: null,
    address: faker.location.streetAddress(),
    addressNumber: faker.location.buildingNumber(),
    complement: null,
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode(),
    birthDate: faker.date.birthdate(),
    activeSalonId: null,
    deletedAt: null,
  };
}
