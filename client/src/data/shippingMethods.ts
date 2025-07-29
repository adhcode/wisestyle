export interface ShippingMethod {
  name: string;
  deliveryTime: string;
  price: number;
  type?: 'shipping' | 'pickup';
  address?: string;
}

// Helper function to find shipping zone by area name
export const findShippingZoneByArea = (areaName: string): ShippingMethod | null => {
  const normalizedArea = areaName.toLowerCase().trim();

  const areaToZoneMap: { [key: string]: number } = {
    // Zone 1 - ₦2,000
    'ijaiye': 2000,

    // Zone 2 - ₦2,500
    'alakuko': 2500, 'meiran': 2500, 'kola': 2500, 'iyana-paja': 2500, 'aboru': 2500,
    'ipaja': 2500, 'abule-egba': 2500, 'abattoir': 2500, 'omole': 2500, 'command': 2500,
    'dopemu': 2500, 'iju ishaga': 2500, 'ayobo': 2500, 'fagba': 2500, 'ait': 2500,
    'cement': 2500, 'akowonjo': 2500,

    // Zone 3 - ₦3,000
    'magodo': 3000, 'ikeja': 3000, 'ogudu': 3000, 'alapere': 3000, 'yaba': 3000,
    'bariga': 3000, 'shomolu': 3000, 'oshodi': 3000, 'ojodu berger': 3000, 'idimu': 3000,
    'maryland': 3000, 'anthony': 3000, 'ojota': 3000, 'ketu': 3000, 'mile 12': 3000,
    'ajao estate': 3000,

    // Zone 4 - ₦3,500
    'okota': 3500, 'satelite': 3500, 'onipan': 3500, 'isheri': 3500, 'ikotun': 3500,
    'egbeda': 3500, 'igando': 3500, 'palmgrove': 3500, 'surulere': 3500, 'ijegun': 3500,
    'gbagada': 3500, 'ojuelegba': 3500, 'ebute-meta': 3500, 'idi araba': 3500,
    'ejigbo': 3500, 'isolo': 3500, 'mushin': 3500,

    // Zone 5 - ₦4,000
    'ogba': 4000, 'iijora': 4000, 'marina': 4000, 'cms': 4000, 'ijora': 4000,
    'orile-iganmu': 4000,

    // Zone 6 - ₦4,500
    'mile 2': 4500, 'ikoyi': 4500, 'vi': 4500, 'victoria island': 4500, 'lagos island': 4500,
    'lekki phase 1': 4500, 'lekki phase 2': 4500, 'idumota': 4500,

    // Zone 7 - ₦5,000
    'ajegunle': 5000, 'apapa': 5000, 'agungi': 5000, 'orchid': 5000, 'ajah': 5000,

    // Zone 8 - ₦6,000
    'sango-tedo': 6000, 'ikorodu extreme': 6000,

    // Zone 9 - ₦10,000
    'awoyaya': 10000, 'abijo': 10000, 'ibeju-lekki': 10000,
  };

  const price = areaToZoneMap[normalizedArea];
  if (price) {
    return shippingMethods.find(method => method.price === price && method.type === 'shipping') || null;
  }

  return null;
};

export const shippingMethods: ShippingMethod[] = [
  // Pickup Options (Free) - Save on delivery costs!
  {
    name: "Pickup - LKJ Gardens Shopping Complex",
    deliveryTime: "Ready for pickup in 2-4 hours",
    price: 0,
    type: 'pickup',
    address: "LKJ GARDENS SHOPPING COMPLEX, Shop No. FF40, First Floor, NYSC Bus-Stop, Igando"
  },
  {
    name: "Pickup - Leadway Assurance",
    deliveryTime: "Ready for pickup in 2-4 hours",
    price: 0,
    type: 'pickup',
    address: "Leadway Assurance Company Ltd, 121/123 Funso Williams Avenue, Iponri, Surulere"
  },
  {
    name: "Pickup - Abule-Egba Location",
    deliveryTime: "Ready for pickup in 2-4 hours",
    price: 0,
    type: 'pickup',
    address: "No 26A, Old Ota Road, Ekoro Junction, Jesu Seun Block Bus Stop, Abule-Egba"
  },
  // Lagos Shipping Options - Organized by Price Zones
  {
    name: "Lagos Zone 1 - ₦2,000 (Ijaiye)",
    deliveryTime: "Same day delivery (2-6 hours)",
    price: 2000,
    type: 'shipping'
  },
  {
    name: "Lagos Zone 2 - ₦2,500 (Alakuko, Meiran, Kola, Iyana-Paja, Aboru, Ipaja, Abule-Egba, Abattoir, Omole 1&2, Command, Dopemu, Iju Ishaga, Ayobo, Fagba, AIT, Cement, Akowonjo)",
    deliveryTime: "Same day delivery (2-6 hours)",
    price: 2500,
    type: 'shipping'
  },
  {
    name: "Lagos Zone 3 - ₦3,000 (Magodo, Ikeja, Ogudu, Alapere, Yaba, Bariga, Shomolu, Oshodi, Ojodu Berger, Idimu, Maryland, Anthony, Ojota, Ketu, Mile 12, Ajao Estate)",
    deliveryTime: "Same day delivery (2-6 hours)",
    price: 3000,
    type: 'shipping'
  },
  {
    name: "Lagos Zone 4 - ₦3,500 (Okota, Satelite, Onipan, Oshodi, Isheri, Ikotun, Egbeda, Igando, Palmgrove, Surulere, Ijegun, Gbagada, Ojuelegba, Ebute-Meta, Idi Araba, Ejigbo, Isolo, Bariga, Mushin)",
    deliveryTime: "Same day delivery (2-6 hours)",
    price: 3500,
    type: 'shipping'
  },
  {
    name: "Lagos Zone 5 - ₦4,000 (Ogba, Iijora, Marina, CMS, Ijora, Orile-Iganmu)",
    deliveryTime: "Same day delivery (2-6 hours)",
    price: 4000,
    type: 'shipping'
  },
  {
    name: "Lagos Zone 6 - ₦4,500 (Mile 2, Ikoyi, VI, Lagos Island, Lekki Phase 1, Lekki Phase 2, Idumota)",
    deliveryTime: "Same day delivery (2-6 hours)",
    price: 4500,
    type: 'shipping'
  },
  {
    name: "Lagos Zone 7 - ₦5,000 (Ajegunle, Apapa, Agungi, Orchid, Ajah)",
    deliveryTime: "Next day delivery (24 hours)",
    price: 5000,
    type: 'shipping'
  },
  {
    name: "Lagos Zone 8 - ₦6,000 (Sango-Tedo, Ikorodu Extreme)",
    deliveryTime: "Next day delivery (24 hours)",
    price: 6000,
    type: 'shipping'
  },
  {
    name: "Lagos Zone 9 - ₦10,000 (Awoyaya, Abijo, Ibeju-Lekki)",
    deliveryTime: "Next day delivery (24-48 hours)",
    price: 10000,
    type: 'shipping'
  },
  {
    name: "South West (Ekiti, Osun, Ondo, Ogun, Oyo)",
    deliveryTime: "Takes 3-5 working days",
    price: 5500,
    type: 'shipping'
  },
  {
    name: "South (Akwa-Ibom, Bayelsa, Cross-River, Delta, Edo, Rivers)",
    deliveryTime: "Takes 3-5 working days",
    price: 6000,
    type: 'shipping'
  },
  {
    name: "South East (Abia, Anambra, Ebonyi, Enugu, Imo)",
    deliveryTime: "Takes 3-5 working days",
    price: 6000,
    type: 'shipping'
  },
  {
    name: "North Central (Benue, FCT, Kogi, Kwara, Nasarawa, Niger, Plateau)",
    deliveryTime: "Takes 3-5 working days",
    price: 7000,
    type: 'shipping'
  },
  {
    name: "North East (Adamawa, Bauchi, Borno, Gombe, Taraba, Yobe)",
    deliveryTime: "Takes 3-5 working days",
    price: 7500,
    type: 'shipping'
  },
  {
    name: "North West (Kaduna, Katsina, Kano, Kebbi, Sokoto, Jigawa, Zamfara)",
    deliveryTime: "Takes 3-5 working days",
    price: 7500,
    type: 'shipping'
  },

]; 