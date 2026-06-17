export type ShippingOption = {
  id: string;
  service: string;
  price: number;
  deliveryTime: number;
  destinationCep: string;
  source: "superfrete";
};

export type ShippingEstimate = {
  cep: string;
  options: ShippingOption[];
  selectedService?: string;
  message: string;
  calculatedAt: string;
};
