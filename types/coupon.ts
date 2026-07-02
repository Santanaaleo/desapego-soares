export type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AppliedCoupon = {
  code: string;
  discountPercent: number;
  discountAmount: number;
  subtotal?: number;
};
