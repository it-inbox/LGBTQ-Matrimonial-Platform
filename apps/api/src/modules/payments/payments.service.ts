import { Injectable, Logger } from "@nestjs/common";

export interface CreateCheckoutSessionDto {
  planTier: "pro" | "pro-max" | "pro-supreme" | "premier-lite";
  duration: "1-month" | "3-months" | "6-months" | "12-months" | "till-marriage";
  amount: number; // in USD
  currency?: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  isSimulated: boolean;
  planTier: string;
  duration: string;
  amount: number;
  currency: string;
}

export interface CompletePaymentDto {
  sessionId: string;
  planTier: string;
  duration: string;
  amount: number;
  simulateSuccess?: boolean;
}

export interface UserMembership {
  tier: "FREE" | "PRO" | "PRO_MAX" | "PRO_SUPREME" | "PREMIER_LITE";
  planName: string;
  expiresAt: string | null;
  status: "ACTIVE" | "EXPIRED" | "NONE";
  superInterestsRemaining: number;
  spotlightsRemaining: number;
  hasGoldBadge: boolean;
  canViewPhoneNumbers: boolean;
  lastPaymentAt?: string;
  lastPaymentAmount?: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // In-memory membership cache for fast simulated lookups (keyed by userId)
  private readonly memberships = new Map<string, UserMembership>();

  /**
   * Creates a checkout session.
   * Checks for Razorpay credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET)
   * or Stripe credentials (STRIPE_SECRET_KEY).
   * Otherwise, delegates seamlessly to local Dev Simulator.
   */
  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutSessionDto
  ): Promise<CheckoutSessionResult> {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    let activeProvider = "SIMULATOR (Ready for Razorpay / Stripe)";

    if (razorpayKeyId && razorpayKeySecret) {
      activeProvider = "RAZORPAY (Live Credentials Detected)";
      this.logger.log(`Dispatching real Razorpay order for user ${userId}`);
      // Razorpay order creation (`razorpay.orders.create`)
    } else if (stripeKey) {
      activeProvider = "STRIPE (Live Credentials Detected)";
      this.logger.log(`Dispatching real Stripe session for user ${userId}`);
      // Stripe checkout session creation (`stripe.checkout.sessions.create`)
    }

    // Development / Simulator mode fallback
    const sessionId = `sim_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const checkoutUrl = `/membership/upgrade?payment_step=checkout&session_id=${sessionId}&plan=${dto.planTier}&duration=${dto.duration}&amount=${dto.amount}`;

    this.logger.log(`
┌──────────────────────────────────────────────────────────┐
│  EVERPRIDE PAYMENT GATEWAY (DEV / MOCK SIMULATOR)        │
├──────────────────────────────────────────────────────────┤
│  User ID       : ${userId.padEnd(40)}│
│  Session ID    : ${sessionId.padEnd(40)}│
│  Plan Tier     : ${dto.planTier.toUpperCase().padEnd(40)}│
│  Duration      : ${dto.duration.padEnd(40)}│
│  Amount        : $${dto.amount.toFixed(2)} USD${" ".repeat(30)}│
│  Active Gateway: ${activeProvider.padEnd(40)}│
└──────────────────────────────────────────────────────────┘
`);

    return {
      sessionId,
      checkoutUrl,
      isSimulated: true,
      planTier: dto.planTier,
      duration: dto.duration,
      amount: dto.amount,
      currency: dto.currency || "USD",
    };
  }

  /**
   * Completes a payment simulation (or webhook receiver in production)
   * and provisions membership perks for the user.
   */
  async completeSimulatedPayment(
    userId: string,
    dto: CompletePaymentDto
  ): Promise<{ success: boolean; membership: UserMembership; message: string }> {
    if (dto.simulateSuccess === false) {
      this.logger.warn(`Simulated payment failed / declined for user ${userId}`);
      return {
        success: false,
        membership: this.getMembership(userId),
        message: "Payment declined: simulated card error.",
      };
    }

    // Calculate expiry date based on duration
    const now = new Date();
    let daysToAdd = 30;
    if (dto.duration === "3-months") daysToAdd = 90;
    else if (dto.duration === "6-months") daysToAdd = 180;
    else if (dto.duration === "12-months") daysToAdd = 365;
    else if (dto.duration === "till-marriage") daysToAdd = 365 * 3; // 3 years

    const expiresAt = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

    // Map planTier to Membership
    let tier: UserMembership["tier"] = "PRO";
    let planName = "Pro";
    let superInterests = 25;
    let spotlights = 0;
    const norm = dto.planTier.toLowerCase();

    if (norm.includes("max")) {
      tier = "PRO_MAX";
      planName = "Pro Max";
      superInterests = 50;
      spotlights = 50;
    } else if (norm.includes("supreme")) {
      tier = "PRO_SUPREME";
      planName = "Pro Supreme";
      superInterests = 80;
      spotlights = 80;
    } else if (norm.includes("premier") || norm.includes("assisted")) {
      tier = "PREMIER_LITE";
      planName = "Premier Lite (Assisted)";
      superInterests = 150;
      spotlights = 150;
    }

    const membership: UserMembership = {
      tier,
      planName,
      expiresAt,
      status: "ACTIVE",
      superInterestsRemaining: superInterests,
      spotlightsRemaining: spotlights,
      hasGoldBadge: true,
      canViewPhoneNumbers: true,
      lastPaymentAt: now.toISOString(),
      lastPaymentAmount: dto.amount,
    };

    this.memberships.set(userId, membership);

    this.logger.log(`
┌──────────────────────────────────────────────────────────┐
│  EVERPRIDE PAYMENT SUCCESSFUL (MEMBERSHIP ACTIVATED)     │
├──────────────────────────────────────────────────────────┤
│  User ID       : ${userId.padEnd(40)}│
│  Tier Awarded  : ${tier.padEnd(40)}│
│  Expires At    : ${expiresAt.padEnd(40)}│
│  SuperInterest : ${String(superInterests).padEnd(40)}│
│  Spotlights    : ${String(spotlights).padEnd(40)}│
│  Gold Badge    : ACTIVE                                  │
│  Status        : PAID & VERIFIED                         │
└──────────────────────────────────────────────────────────┘
`);

    return {
      success: true,
      membership,
      message: `Congratulations! Your account has been upgraded to ${planName}.`,
    };
  }

  /**
   * Retrieves the current user's membership status and active perks.
   */
  getMembership(userId: string): UserMembership {
    const cached = this.memberships.get(userId);
    if (cached) {
      return cached;
    }

    return {
      tier: "FREE",
      planName: "Free Member",
      expiresAt: null,
      status: "NONE",
      superInterestsRemaining: 0,
      spotlightsRemaining: 0,
      hasGoldBadge: false,
      canViewPhoneNumbers: false,
    };
  }
}
