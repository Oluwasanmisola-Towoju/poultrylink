const { prisma } = require('../../backend/src/config/dbHandler');
const env = require('../../backend/src/config/env');
const bcrypt = require('bcryptjs');

const CATEGORIES = [
    { name: 'Live Birds', slug: 'live-birds' },
    { name: 'Eggs', slug: 'eggs' },
    { name: 'Day-Old Chicks', slug: 'day-old-chicks' },
    { name: 'Feed', slug: 'feed' },
    { name: 'Drugs', slug: 'drugs' },
    { name: 'Equipment', slug: 'equipment' },
    { name: 'Manure', slug: 'manure' }
];

// Shared by every test account. Passes the backend's password regex even
// though seeding bypasses the validator (direct Prisma create, not the
// register endpoint) — kept regex-valid so the same password also works if
// you ever register one of these emails through the UI instead.
const TEST_PASSWORD = 'Test1234!';

const TEST_USERS = [
    { email: 'buyer@test.poultrylink.dev', role: 'BUYER', firstName: 'Bola', lastName: 'Buyer' },
    { email: 'farmer@test.poultrylink.dev', role: 'FARMER', firstName: 'Farouk', lastName: 'Farmer' },
    { email: 'transporter@test.poultrylink.dev', role: 'TRANSPORTER', firstName: 'Tunde', lastName: 'Transporter' },
    { email: 'admin@test.poultrylink.dev', role: 'ADMIN', firstName: 'Ada', lastName: 'Admin' }
];

async function seedCategories() {
    for (const category of CATEGORIES) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category
        });
    }
    console.log(`Seeded ${CATEGORIES.length} categories`);
}

async function seedTestUsers() {
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, env.BCRYPT_SALT_ROUNDS);
    const users = {};

    for (const u of TEST_USERS) {
        users[u.role] = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                passwordHash,
                role: u.role,
                isEmailVerified: true,
                // Admin needs VERIFIED to be useful right away. The other
                // three stay PENDING on purpose — that's the real state an
                // account is in once it verifies its email, and it gives
                // /admin/verification something to act on immediately.
                verificationStatus: u.role === 'ADMIN' ? 'VERIFIED' : 'PENDING',
                profile: { create: { firstName: u.firstName, lastName: u.lastName } }
            },
            include: { profile: true }
        });
    }

    console.log(`Test accounts (all share the password "${TEST_PASSWORD}"):`);
    for (const u of TEST_USERS) console.log(`  ${u.role.padEnd(12)} ${u.email}`);

    return users;
}

async function seedFarmAndListing(farmer) {
    let farm = await prisma.farm.findFirst({ where: { ownerId: farmer.id, name: 'Test Farm' } });
    if (!farm) {
        farm = await prisma.farm.create({
            data: { ownerId: farmer.id, name: 'Test Farm', state: 'Lagos', lga: 'Ikeja' }
        });
    }

    const category = await prisma.category.findUnique({ where: { slug: 'live-birds' } });

    let listing = await prisma.listing.findFirst({
        where: { sellerId: farmer.id, productName: 'Test Broiler Chickens' }
    });
    if (!listing) {
        listing = await prisma.listing.create({
            data: {
                sellerId: farmer.id,
                farmId: farm.id,
                categoryId: category.id,
                productName: 'Test Broiler Chickens',
                quantity: 100,
                unit: 'birds',
                price: 5000,
                minOrderQuantity: 5,
                state: 'Lagos',
                lga: 'Ikeja'
            }
        });
    }

    console.log(`Test listing "${listing.productName}" (${listing.id}) on farm "${farm.name}"`);
    return { farm, listing };
}

async function main() {
    await seedCategories();
    const users = await seedTestUsers();
    await seedFarmAndListing(users.FARMER);
}

main()
    .catch((err) => {
        console.error('Seed failed:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });