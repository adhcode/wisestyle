const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearOrders() {
    try {
        console.log('🧹 Starting to clear all orders from database...');

        // Delete in the correct order due to foreign key constraints
        
        // 1. Delete refunds first (they reference payments)
        const refundsDeleted = await prisma.refund.deleteMany({});
        console.log(`✅ Deleted ${refundsDeleted.count} refunds`);

        // 2. Delete payments (they reference orders)
        const paymentsDeleted = await prisma.payment.deleteMany({});
        console.log(`✅ Deleted ${paymentsDeleted.count} payments`);

        // 3. Delete order items (they reference orders)
        const orderItemsDeleted = await prisma.orderItem.deleteMany({});
        console.log(`✅ Deleted ${orderItemsDeleted.count} order items`);

        // 4. Finally delete orders
        const ordersDeleted = await prisma.order.deleteMany({});
        console.log(`✅ Deleted ${ordersDeleted.count} orders`);

        console.log('🎉 Successfully cleared all orders from database!');
        console.log('📊 Summary:');
        console.log(`   - Orders: ${ordersDeleted.count}`);
        console.log(`   - Order Items: ${orderItemsDeleted.count}`);
        console.log(`   - Payments: ${paymentsDeleted.count}`);
        console.log(`   - Refunds: ${refundsDeleted.count}`);

    } catch (error) {
        console.error('❌ Error clearing orders:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
clearOrders()
    .then(() => {
        console.log('✨ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });