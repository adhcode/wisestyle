const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTestOrders() {
    try {
        console.log('🧹 Starting to clear test orders from database...');

        // You can modify these conditions to target specific test orders
        const testConditions = {
            OR: [
                // Orders with test email patterns
                { email: { contains: 'test' } },
                { email: { contains: 'example' } },
                { email: { contains: 'demo' } },
                // Orders from today (assuming they are test orders)
                { 
                    createdAt: { 
                        gte: new Date(new Date().setHours(0, 0, 0, 0)) 
                    } 
                },
                // Orders with specific test phone numbers
                { phone: { contains: '1234567890' } },
                { phone: { contains: '0000000000' } },
            ]
        };

        // First, let's see what we're about to delete
        const ordersToDelete = await prisma.order.findMany({
            where: testConditions,
            include: {
                items: true,
                payments: {
                    include: {
                        refunds: true
                    }
                }
            }
        });

        console.log(`📋 Found ${ordersToDelete.length} test orders to delete:`);
        ordersToDelete.forEach(order => {
            console.log(`   - Order ${order.id.slice(0, 8)} (${order.email}) - ₦${order.total.toLocaleString()}`);
        });

        if (ordersToDelete.length === 0) {
            console.log('✨ No test orders found to delete!');
            return;
        }

        // Ask for confirmation (in a real script, you might want to add readline for user input)
        console.log('\n⚠️  This will permanently delete the above orders. Proceeding...\n');

        // Get order IDs for deletion
        const orderIds = ordersToDelete.map(order => order.id);

        // Delete in the correct order due to foreign key constraints
        
        // 1. Delete refunds first
        const refundsDeleted = await prisma.refund.deleteMany({
            where: {
                payment: {
                    orderId: { in: orderIds }
                }
            }
        });
        console.log(`✅ Deleted ${refundsDeleted.count} refunds`);

        // 2. Delete payments
        const paymentsDeleted = await prisma.payment.deleteMany({
            where: {
                orderId: { in: orderIds }
            }
        });
        console.log(`✅ Deleted ${paymentsDeleted.count} payments`);

        // 3. Delete order items
        const orderItemsDeleted = await prisma.orderItem.deleteMany({
            where: {
                orderId: { in: orderIds }
            }
        });
        console.log(`✅ Deleted ${orderItemsDeleted.count} order items`);

        // 4. Finally delete orders
        const ordersDeleted = await prisma.order.deleteMany({
            where: testConditions
        });
        console.log(`✅ Deleted ${ordersDeleted.count} test orders`);

        console.log('🎉 Successfully cleared test orders from database!');
        console.log('📊 Summary:');
        console.log(`   - Orders: ${ordersDeleted.count}`);
        console.log(`   - Order Items: ${orderItemsDeleted.count}`);
        console.log(`   - Payments: ${paymentsDeleted.count}`);
        console.log(`   - Refunds: ${refundsDeleted.count}`);

    } catch (error) {
        console.error('❌ Error clearing test orders:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
clearTestOrders()
    .then(() => {
        console.log('✨ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });