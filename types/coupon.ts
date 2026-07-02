export type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
};

export type AppliedCoupon = {
  code: string;
  discountPercent: number;
  discountAmount: number;
  subtotal?: number;
};
