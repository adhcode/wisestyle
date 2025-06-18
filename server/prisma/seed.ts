import { PrismaClient, DisplaySection, ProductStatus } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@wisestyle.ng';
  const plainPassword = 'adminwisestyle';
  const password = await bcrypt.hash(plainPassword, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password, role: 'ADMIN' },
    create: {
      email,
      password,
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  console.log('Admin user seeded!');

  // Create main categories with their subcategories
  const nativeWear = await prisma.category.upsert({
    where: { slug: 'native-wear' },
    update: {},
    create: {
      name: 'Native Wear',
      slug: 'native-wear',
      type: 'clothing',
      description: 'Traditional Nigerian attire',
      image: '/images/categories/native-wear.jpg',
      displayOrder: 1,
      children: {
        create: [
          {
            name: 'Agbada',
            slug: 'agbada',
            type: 'clothing',
            description: 'Traditional flowing wide-sleeved robes',
            image: '/images/categories/agbada.jpg',
            displayOrder: 1,
          },
          {
            name: 'Kaftan',
            slug: 'kaftan',
            type: 'clothing',
            description: 'Elegant ankle-length garments',
            image: '/images/categories/kaftan.jpg',
            displayOrder: 2,
          },
          {
            name: 'Senator',
            slug: 'senator',
            type: 'clothing',
            description: 'Modern Nigerian political wear',
            image: '/images/categories/senator.jpg',
            displayOrder: 3,
          },
        ],
      },
    },
  });

  const shirts = await prisma.category.upsert({
    where: { slug: 'shirts' },
    update: {},
    create: {
      name: 'Shirts',
      slug: 'shirts',
      type: 'clothing',
      description: 'All types of shirts',
      image: '/images/categories/shirts.jpg',
      displayOrder: 2,
      children: {
        create: [
          {
            name: 'T-Shirts',
            slug: 't-shirts',
            type: 'clothing',
            description: 'Casual and comfortable t-shirts',
            image: '/images/categories/t-shirts.jpg',
            displayOrder: 1,
          },
          {
            name: 'Polo',
            slug: 'polo',
            type: 'clothing',
            description: 'Classic polo shirts',
            image: '/images/categories/polo.jpg',
            displayOrder: 2,
          },
          {
            name: 'Casual Shirts',
            slug: 'casual-shirts',
            type: 'clothing',
            description: 'Everyday casual shirts',
            image: '/images/categories/casual-shirts.jpg',
            displayOrder: 3,
          },
        ],
      },
    },
  });

  const trousers = await prisma.category.upsert({
    where: { slug: 'trousers' },
    update: {},
    create: {
      name: 'Trousers',
      slug: 'trousers',
      type: 'clothing',
      description: 'All types of trousers',
      image: '/images/categories/trousers.jpg',
      displayOrder: 3,
      children: {
        create: [
          {
            name: 'Pant Trousers',
            slug: 'pant-trousers',
            type: 'clothing',
            description: 'Formal and casual pant trousers',
            image: '/images/categories/pant-trousers.jpg',
            displayOrder: 1,
          },
          {
            name: 'Jeans',
            slug: 'jeans',
            type: 'clothing',
            description: 'Denim jeans collection',
            image: '/images/categories/jeans.jpg',
            displayOrder: 2,
          },
          {
            name: 'Chinos',
            slug: 'chinos',
            type: 'clothing',
            description: 'Classic chino trousers',
            image: '/images/categories/chinos.jpg',
            displayOrder: 3,
          },
          {
            name: 'Shorts',
            slug: 'shorts',
            type: 'clothing',
            description: 'Casual and sports shorts',
            image: '/images/categories/shorts.jpg',
            displayOrder: 4,
          },
        ],
      },
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      type: 'accessories',
      description: 'Fashion accessories',
      image: '/images/categories/accessories.jpg',
      displayOrder: 4,
      children: {
        create: [
          {
            name: 'Fila',
            slug: 'fila',
            type: 'accessories',
            description: 'Traditional Nigerian caps',
            image: '/images/categories/fila.jpg',
            displayOrder: 1,
          },
          {
            name: 'Sunglasses',
            slug: 'sunglasses',
            type: 'accessories',
            description: 'Stylish sunglasses collection',
            image: '/images/categories/sunglasses.jpg',
            displayOrder: 2,
          },
          {
            name: 'Watches',
            slug: 'watches',
            type: 'accessories',
            description: 'Premium watches',
            image: '/images/categories/watches.jpg',
            displayOrder: 3,
          },
          {
            name: 'Cufflinks',
            slug: 'cufflinks',
            type: 'accessories',
            description: 'Elegant cufflinks',
            image: '/images/categories/cufflinks.jpg',
            displayOrder: 4,
          },
        ],
      },
    },
  });

  // Create Footwears category
  const footwears = await prisma.category.upsert({
    where: { slug: 'footwears' },
    update: {},
    create: {
      name: 'Footwears',
      slug: 'footwears',
      type: 'footwear',
      description: 'Footwear collection for every occasion',
      image: '/images/categories/footwears.jpg',
      displayOrder: 5,
      children: {
        create: [
          {
            name: 'Shoes',
            slug: 'shoes',
            type: 'footwear',
            description: 'Formal and casual shoes',
            image: '/images/categories/shoes.jpg',
            displayOrder: 1,
          },
          {
            name: 'Sneakers',
            slug: 'sneakers',
            type: 'footwear',
            description: 'Trendy sneakers',
            image: '/images/categories/sneakers.jpg',
            displayOrder: 2,
          },
          {
            name: 'Slides',
            slug: 'slides',
            type: 'footwear',
            description: 'Comfortable slides',
            image: '/images/categories/slides.jpg',
            displayOrder: 3,
          },
        ],
      },
    },
  });

  // Create sizes
  const sizes = await Promise.all([
    prisma.size.upsert({
      where: { value_category: { value: 'S', category: 'clothing' } },
      update: {},
      create: {
        name: 'Small',
        value: 'S',
        category: 'clothing',
      },
    }),
    prisma.size.upsert({
      where: { value_category: { value: 'M', category: 'clothing' } },
      update: {},
      create: {
        name: 'Medium',
        value: 'M',
        category: 'clothing',
      },
    }),
    prisma.size.upsert({
      where: { value_category: { value: 'L', category: 'clothing' } },
      update: {},
      create: {
        name: 'Large',
        value: 'L',
        category: 'clothing',
      },
    }),
    prisma.size.upsert({
      where: { value_category: { value: 'XL', category: 'clothing' } },
      update: {},
      create: {
        name: 'Extra Large',
        value: 'XL',
        category: 'clothing',
      },
    }),
    prisma.size.upsert({
      where: { value_category: { value: 'XXL', category: 'clothing' } },
      update: {},
      create: {
        name: 'Double Extra Large',
        value: 'XXL',
        category: 'clothing',
      },
    }),
  ]);

  // Create colors
  const colors = await Promise.all([
    prisma.color.upsert({
      where: { value: 'black' },
      update: {},
      create: {
        name: 'Black',
        value: 'black',
        class: 'bg-black',
      },
    }),
    prisma.color.upsert({
      where: { value: 'white' },
      update: {},
      create: {
        name: 'White',
        value: 'white',
        class: 'bg-white',
      },
    }),
    prisma.color.upsert({
      where: { value: 'blue' },
      update: {},
      create: {
        name: 'Blue',
        value: 'blue',
        class: 'bg-blue-500',
      },
    }),
    prisma.color.upsert({
      where: { value: 'brown' },
      update: {},
      create: {
        name: 'Brown',
        value: 'brown',
        class: 'bg-amber-900',
      },
    }),
    prisma.color.upsert({
      where: { value: 'gray' },
      update: {},
      create: {
        name: 'Gray',
        value: 'gray',
        class: 'bg-gray-500',
      },
    }),
  ]);

  console.log('Database has been seeded with categories, sizes, and colors! 🌱');

  // Function to create a product with its relationships
  async function createProduct(data: any) {
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      categoryId,
      image,
      tags,
      isLimited,
      displaySection,
      sizes: sizeValues,
      colors: colorValues,
      inventory,
    } = data;

    // Create or find sizes
    const sizes = await Promise.all(
      sizeValues.map(async (value: string) => {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });
        return prisma.size.upsert({
          where: {
            value_category: {
              value,
              category: category?.type || 'clothing',
            },
          },
          update: {},
          create: {
            name: value,
            value,
            category: category?.type || 'clothing',
          },
        });
      })
    );

    // Create or find colors
    const colors = await Promise.all(
      colorValues.map(async (value: string) => {
        return prisma.color.upsert({
          where: { value },
          update: {},
          create: {
            name: value,
            value,
            class: `bg-[${value}]`,
          },
        });
      })
    );

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice,
        discount,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        categoryId,
        image,
        tags,
        isLimited,
        displaySection: DisplaySection[displaySection as keyof typeof DisplaySection],
        sizes: {
          connect: sizes.map(size => ({ id: size.id })),
        },
        colors: {
          connect: colors.map(color => ({ id: color.id })),
        },
      },
    });

    // Create inventory entries
    for (const item of inventory) {
      const size = sizes.find(s => s.value === item.size);
      const color = colors.find(c => c.value === item.color);
      if (size && color) {
        await prisma.productInventory.create({
          data: {
            productId: product.id,
            sizeId: size.id,
            colorId: color.id,
            quantity: item.quantity,
          },
        });
      }
    }

    return product;
  }

  // Create Native Wear products
  const nativeWearProducts = [
    {
      name: 'Premium Agbada Set',
      description: 'Luxurious embroidered Agbada set with matching cap',
      price: 45000,
      originalPrice: 50000,
      discount: 10,
      categoryId: nativeWear.id,
      image: '/images/new-arrivals/agbada.png',
      tags: ['agbada', 'traditional', 'premium'],
      isLimited: false,
      displaySection: 'NEW_ARRIVAL',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#FFFFFF', '#C4B5A9', '#2B2B2B'],
      inventory: [
        { size: 'S', color: '#FFFFFF', quantity: 10 },
        { size: 'M', color: '#FFFFFF', quantity: 15 },
        { size: 'L', color: '#FFFFFF', quantity: 15 },
        { size: 'XL', color: '#FFFFFF', quantity: 10 },
        { size: 'XXL', color: '#FFFFFF', quantity: 5 },
        { size: 'S', color: '#C4B5A9', quantity: 10 },
        { size: 'M', color: '#C4B5A9', quantity: 15 },
        { size: 'L', color: '#C4B5A9', quantity: 15 },
        { size: 'XL', color: '#C4B5A9', quantity: 10 },
        { size: 'XXL', color: '#C4B5A9', quantity: 5 },
        { size: 'S', color: '#2B2B2B', quantity: 10 },
        { size: 'M', color: '#2B2B2B', quantity: 15 },
        { size: 'L', color: '#2B2B2B', quantity: 15 },
        { size: 'XL', color: '#2B2B2B', quantity: 10 },
        { size: 'XXL', color: '#2B2B2B', quantity: 5 },
      ]
    },
    {
      name: 'Designer Kaftan',
      description: 'Elegant designer Kaftan with intricate embroidery',
      price: 35000,
      originalPrice: 40000,
      discount: 12.5,
      categoryId: nativeWear.id,
      image: '/images/new-arrivals/kaftan.png',
      tags: ['kaftan', 'designer', 'traditional'],
      isLimited: false,
      displaySection: 'NEW_ARRIVAL',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#FFFFFF', '#8B4513', '#000000'],
      inventory: [
        { size: 'S', color: '#FFFFFF', quantity: 8 },
        { size: 'M', color: '#FFFFFF', quantity: 12 },
        { size: 'L', color: '#FFFFFF', quantity: 12 },
        { size: 'XL', color: '#FFFFFF', quantity: 8 },
        { size: 'XXL', color: '#FFFFFF', quantity: 4 },
        { size: 'S', color: '#8B4513', quantity: 8 },
        { size: 'M', color: '#8B4513', quantity: 12 },
        { size: 'L', color: '#8B4513', quantity: 12 },
        { size: 'XL', color: '#8B4513', quantity: 8 },
        { size: 'XXL', color: '#8B4513', quantity: 4 },
        { size: 'S', color: '#000000', quantity: 8 },
        { size: 'M', color: '#000000', quantity: 12 },
        { size: 'L', color: '#000000', quantity: 12 },
        { size: 'XL', color: '#000000', quantity: 8 },
        { size: 'XXL', color: '#000000', quantity: 4 },
      ]
    },
    {
      name: 'Senator Suit',
      description: 'Modern Senator suit with perfect fit and comfort',
      price: 30000,
      originalPrice: 35000,
      discount: 14.3,
      categoryId: nativeWear.id,
      image: '/images/products/senator-suit.jpg',
      tags: ['senator', 'modern', 'traditional'],
      isLimited: false,
      displaySection: 'TRENDING',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#000000', '#1B1B1B', '#363636'],
      inventory: [
        { size: 'S', color: '#000000', quantity: 10 },
        { size: 'M', color: '#000000', quantity: 15 },
        { size: 'L', color: '#000000', quantity: 15 },
        { size: 'XL', color: '#000000', quantity: 10 },
        { size: 'XXL', color: '#000000', quantity: 5 },
        { size: 'S', color: '#1B1B1B', quantity: 10 },
        { size: 'M', color: '#1B1B1B', quantity: 15 },
        { size: 'L', color: '#1B1B1B', quantity: 15 },
        { size: 'XL', color: '#1B1B1B', quantity: 10 },
        { size: 'XXL', color: '#1B1B1B', quantity: 5 },
        { size: 'S', color: '#363636', quantity: 10 },
        { size: 'M', color: '#363636', quantity: 15 },
        { size: 'L', color: '#363636', quantity: 15 },
        { size: 'XL', color: '#363636', quantity: 10 },
        { size: 'XXL', color: '#363636', quantity: 5 },
      ]
    }
  ];

  // Create new arrival products
  const newArrivalProducts = [
    {
      name: 'Casual Shorts',
      description: 'Comfortable and stylish casual shorts perfect for any occasion',
      price: 25000,
      originalPrice: 30000,
      discount: 16.7,
      categoryId: trousers.id,
      image: '/images/new-arrivals/shorts.png',
      tags: ['shorts', 'casual', 'comfortable'],
      isLimited: false,
      displaySection: 'NEW_ARRIVAL',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#000000', '#2B2B2B', '#4A4A4A'],
      inventory: [
        { size: 'S', color: '#000000', quantity: 10 },
        { size: 'M', color: '#000000', quantity: 15 },
        { size: 'L', color: '#000000', quantity: 15 },
        { size: 'XL', color: '#000000', quantity: 10 },
        { size: 'S', color: '#2B2B2B', quantity: 10 },
        { size: 'M', color: '#2B2B2B', quantity: 15 },
        { size: 'L', color: '#2B2B2B', quantity: 15 },
        { size: 'XL', color: '#2B2B2B', quantity: 10 },
        { size: 'S', color: '#4A4A4A', quantity: 10 },
        { size: 'M', color: '#4A4A4A', quantity: 15 },
        { size: 'L', color: '#4A4A4A', quantity: 15 },
        { size: 'XL', color: '#4A4A4A', quantity: 10 },
      ]
    },
    {
      name: 'Classic Chinos Trouser',
      description: 'Premium chinos trouser with perfect fit and comfort',
      price: 25000,
      originalPrice: 30000,
      discount: 16.7,
      categoryId: trousers.id,
      image: '/images/new-arrivals/chinos-trouser.png',
      tags: ['chinos', 'trousers', 'classic'],
      isLimited: false,
      displaySection: 'NEW_ARRIVAL',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#2B2B2B', '#8B4513', '#1B1B1B'],
      inventory: [
        { size: 'S', color: '#2B2B2B', quantity: 10 },
        { size: 'M', color: '#2B2B2B', quantity: 15 },
        { size: 'L', color: '#2B2B2B', quantity: 15 },
        { size: 'XL', color: '#2B2B2B', quantity: 10 },
        { size: 'XXL', color: '#2B2B2B', quantity: 5 },
        { size: 'S', color: '#8B4513', quantity: 10 },
        { size: 'M', color: '#8B4513', quantity: 15 },
        { size: 'L', color: '#8B4513', quantity: 15 },
        { size: 'XL', color: '#8B4513', quantity: 10 },
        { size: 'XXL', color: '#8B4513', quantity: 5 },
        { size: 'S', color: '#1B1B1B', quantity: 10 },
        { size: 'M', color: '#1B1B1B', quantity: 15 },
        { size: 'L', color: '#1B1B1B', quantity: 15 },
        { size: 'XL', color: '#1B1B1B', quantity: 10 },
        { size: 'XXL', color: '#1B1B1B', quantity: 5 },
      ]
    }
  ];

  // Create trending products
  const trendingProducts = [
    {
      name: 'Premium Kaftan',
      description: 'Luxurious Kaftan with modern design and premium fabric',
      price: 25000,
      originalPrice: 30000,
      discount: 16.7,
      categoryId: nativeWear.id,
      image: '/images/trending/kaftant.png',
      tags: ['kaftan', 'traditional', 'premium'],
      isLimited: false,
      displaySection: 'TRENDING',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#FFFFFF', '#000000', '#8B4513'],
      inventory: [
        { size: 'S', color: '#FFFFFF', quantity: 10 },
        { size: 'M', color: '#FFFFFF', quantity: 15 },
        { size: 'L', color: '#FFFFFF', quantity: 15 },
        { size: 'XL', color: '#FFFFFF', quantity: 10 },
        { size: 'XXL', color: '#FFFFFF', quantity: 5 },
        { size: 'S', color: '#000000', quantity: 10 },
        { size: 'M', color: '#000000', quantity: 15 },
        { size: 'L', color: '#000000', quantity: 15 },
        { size: 'XL', color: '#000000', quantity: 10 },
        { size: 'XXL', color: '#000000', quantity: 5 },
        { size: 'S', color: '#8B4513', quantity: 10 },
        { size: 'M', color: '#8B4513', quantity: 15 },
        { size: 'L', color: '#8B4513', quantity: 15 },
        { size: 'XL', color: '#8B4513', quantity: 10 },
        { size: 'XXL', color: '#8B4513', quantity: 5 }
      ]
    },
    {
      name: 'Classic Black T-Shirt',
      description: 'Essential black t-shirt with perfect fit',
      price: 22000,
      originalPrice: 25000,
      discount: 12,
      categoryId: shirts.id,
      image: '/images/trending/blacktshirt.png',
      tags: ['t-shirt', 'casual', 'essential'],
      isLimited: false,
      displaySection: 'TRENDING',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#000000'],
      inventory: [
        { size: 'S', color: '#000000', quantity: 20 },
        { size: 'M', color: '#000000', quantity: 25 },
        { size: 'L', color: '#000000', quantity: 25 },
        { size: 'XL', color: '#000000', quantity: 20 },
        { size: 'XXL', color: '#000000', quantity: 10 }
      ]
    },
    {
      name: 'Premium Watch',
      description: 'Elegant timepiece for the modern gentleman',
      price: 15000,
      originalPrice: 18000,
      discount: 16.7,
      categoryId: accessories.id,
      image: '/images/trending/watches.png',
      tags: ['watch', 'accessories', 'premium'],
      isLimited: true,
      displaySection: 'TRENDING',
      sizes: ['Default'],
      colors: ['#000000', '#8B4513'],
      inventory: [
        { size: 'Default', color: '#000000', quantity: 15 },
        { size: 'Default', color: '#8B4513', quantity: 15 }
      ]
    },
    {
      name: 'Designer Jeans',
      description: 'Premium denim jeans with perfect fit',
      price: 25000,
      originalPrice: 28000,
      discount: 10.7,
      categoryId: trousers.id,
      image: '/images/trending/jean.png',
      tags: ['jeans', 'denim', 'casual'],
      isLimited: false,
      displaySection: 'TRENDING',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#000000', '#1B1B1B'],
      inventory: [
        { size: 'S', color: '#000000', quantity: 10 },
        { size: 'M', color: '#000000', quantity: 15 },
        { size: 'L', color: '#000000', quantity: 15 },
        { size: 'XL', color: '#000000', quantity: 10 },
        { size: 'XXL', color: '#000000', quantity: 5 },
        { size: 'S', color: '#1B1B1B', quantity: 10 },
        { size: 'M', color: '#1B1B1B', quantity: 15 },
        { size: 'L', color: '#1B1B1B', quantity: 15 },
        { size: 'XL', color: '#1B1B1B', quantity: 10 },
        { size: 'XXL', color: '#1B1B1B', quantity: 5 }
      ]
    },
    {
      name: 'Designer Sunglasses',
      description: 'Stylish sunglasses for the fashion-forward man',
      price: 20000,
      originalPrice: 23000,
      discount: 13,
      categoryId: accessories.id,
      image: '/images/trending/sunglass.png',
      tags: ['sunglasses', 'accessories', 'designer'],
      isLimited: true,
      displaySection: 'TRENDING',
      sizes: ['Default'],
      colors: ['#000000', '#8B4513'],
      inventory: [
        { size: 'Default', color: '#000000', quantity: 20 },
        { size: 'Default', color: '#8B4513', quantity: 20 }
      ]
    },
    {
      name: 'Premium White T-Shirt',
      description: 'Classic white t-shirt with superior comfort',
      price: 12000,
      originalPrice: 15000,
      discount: 20,
      categoryId: shirts.id,
      image: '/images/trending/white-shirt.png',
      tags: ['t-shirt', 'casual', 'essential'],
      isLimited: false,
      displaySection: 'TRENDING',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['#FFFFFF'],
      inventory: [
        { size: 'S', color: '#FFFFFF', quantity: 20 },
        { size: 'M', color: '#FFFFFF', quantity: 25 },
        { size: 'L', color: '#FFFFFF', quantity: 25 },
        { size: 'XL', color: '#FFFFFF', quantity: 20 },
        { size: 'XXL', color: '#FFFFFF', quantity: 10 }
      ]
    }
  ];

  // Create all products
  for (const productData of [...nativeWearProducts, ...newArrivalProducts, ...trendingProducts]) {
    await createProduct(productData);
  }

  console.log('Products have been seeded! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
