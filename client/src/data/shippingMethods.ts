export interface ShippingMethod {
  name: string;
  deliveryTime: string;
  price: number;
}

export const shippingMethods: ShippingMethod[] = [
  {
    name: "Lagos Mainland",
    deliveryTime: "Takes 24-48 working hours",
    price: 4000,
  },
  {
    name: "Lagos Island",
    deliveryTime: "Takes 24-48 working hours",
    price: 4500,
  },
  {
    name: "Lagos Tier 1 (Ikorodu, Ajah, Opic, Ojo, Ojodu Berger)",
    deliveryTime: "Takes 24-48 working hours",
    price: 5000,
  },
  {
    name: "South West (Ekiti, Osun, Ondo, Ogun, Oyo)",
    deliveryTime: "Takes 3-5 working days",
    price: 5500,
  },
  {
    name: "South (Akwa-Ibom, Bayelsa, Cross-River, Delta, Edo, Rivers)",
    deliveryTime: "Takes 3-5 working days",
    price: 6000,
  },
  {
    name: "South East (Abia, Anambra, Ebonyi, Enugu, Imo)",
    deliveryTime: "Takes 3-5 working days",
    price: 6000,
  },
  {
    name: "North Central (Benue, FCT, Kogi, Kwara, Nasarawa, Niger, Plateau)",
    deliveryTime: "Takes 3-5 working days",
    price: 7000,
  },
  {
    name: "North East (Adamawa, Bauchi, Borno, Gombe, Taraba, Yobe)",
    deliveryTime: "Takes 3-5 working days",
    price: 7500,
  },
  {
    name: "North West (Kaduna, Katsina, Kano, Kebbi, Sokoto, Jigawa, Zamfara)",
    deliveryTime: "Takes 3-5 working days",
    price: 7500,
  },
  {
    name: "Lagos Outskirts (Epe, Lakowe, Ilaje ajah, ibeju lekki)",
    deliveryTime: "Takes 24-48 working hours",
    price: 5000,
  },
]; 