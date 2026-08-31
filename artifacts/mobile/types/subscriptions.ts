/** Shapes from `.claude/docs/api/subscriptions.md`. Money is always a string. */

export type PackagePeriod = 'monthly' | 'semi_annual' | 'annual';

export interface Package {
  id: number;
  name: string;
  slug: string;
  period: PackagePeriod;
  /** Display-ready, rendered by the server. Use this rather than mapping `period`. */
  period_label: string;
  duration_months: number;
  /** A decimal string — never parse it. See `formatPrice` in `lib/format.ts`. */
  price: string;
  currency: string;
  description: string;
}

export type PaymentMethod = 'cash' | 'paymob';

export interface Payment {
  id: number;
  method: PaymentMethod;
  status: string;
  amount: string;
  currency: string;
  reference: string;
  paid_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: number;
  status: string;
  is_active: boolean;
  period: PackagePeriod;
  /** Display-ready, rendered by the server. Use this rather than mapping `period`. */
  period_label: string;
  duration_months: number;
  price: string;
  currency: string;
  starts_at: string | null;
  ends_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  package: Package;
  payments: Payment[];
}

export interface SubscribeResponse {
  subscription: Subscription;
  payment: {
    method: PaymentMethod;
    status: string;
    reference: string;
    /** Paymob only — the caller must send the user to `checkout_url`. */
    requires_redirect: boolean;
    checkout_url: string | null;
    /** Server-authored, already user-facing. Shown as-is; not translated. */
    message: string;
  };
}
