// Mirrors the Phase 1 slice of the PoultryLink backend's Prisma schema
// (synced against the current schema.prisma on GitHub).

export type UserRole =
  | "FARMER" | "BUYER" | "SUPPLIER" | "TRANSPORTER"
  | "VET" | "COOPERATIVE" | "FINANCIER" | "ADMIN";

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";

export interface Profile {
  firstName: string;
  lastName: string;
  businessName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  address: string | null;
  state: string | null;
  lga: string | null;
}

export interface User {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  verificationStatus: VerificationStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  // NOT included by GET /auth/me today (see note above) — optional until
  // the backend include is added. Don't assume this is always present.
  profile?: Profile;
}

export interface Farm {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  address: string | null;
  state: string | null;
  lga: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  _count?: { listings: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ListingImage {
  id: string;
  url: string;
}

export type ListingStatus = "ACTIVE" | "SOLD_OUT" | "INACTIVE";

export interface Listing {
  id: string;
  sellerId: string;
  seller?: {
    id: string;
    verificationStatus: VerificationStatus;
    profile?: Pick<Profile, "firstName" | "lastName" | "businessName" | "avatarUrl">;
  };
  farmId: string | null;
  farm?: { id: string; name: string; state: string | null; lga: string | null } | null;
  categoryId: string;
  category?: Category;
  productName: string;
  description: string | null;
  quantity: string; // Decimal serialized as string
  unit: string;
  price: string;
  minOrderQuantity: string;
  location: string | null;
  state: string | null;
  lga: string | null;
  availabilityDate: string | null;
  status: ListingStatus;
  verificationStatus: VerificationStatus;
  images: ListingImage[];
  createdAt: string;
}

export type OrderStatus =
  | "PENDING_ACCEPTANCE" | "ACCEPTED" | "REJECTED" | "AWAITING_PAYMENT"
  | "PAID" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CONFIRMED"
  | "COMPLETED" | "CANCELLED" | "CANCELLING" | "DISPUTED";

export interface OrderItem {
  id: string;
  listingId: string;
  listing?: Pick<Listing, "productName">;
  sellerId: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
}

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  orderId: string;
  buyerId: string;
  amount: string;
  provider: "paystack" | "mock";
  providerReference: string;
  status: PaymentStatus;
  paidAt: string | null;
}

export type EscrowStatus = "AWAITING_FUNDS" | "HELD" | "RELEASED" | "REFUNDED" | "REFUNDING" | "DISPUTED";

export interface EscrowTransaction {
  id: string;
  orderId: string;
  amount: string;
  status: EscrowStatus;
  heldAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  disputeReason: string | null;
}

export type DeliveryStatus = "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "CONFIRMED" | "FAILED";

export interface Delivery {
  id: string;
  orderId: string;
  transporterId: string | null;
  status: DeliveryStatus;
  pickupAddress: string | null;
  deliveryAddress: string;
  confirmedAt: string | null;
}

export interface Order {
  id: string;
  buyer?: { profile?: Pick<Profile, "firstName" | "lastName"> };
  buyerId: string;
  status: OrderStatus;
  totalAmount: string;    
  deliveryAddress: string;
  deliveryState: string | null;
  deliveryLga: string | null;
  notes: string | null;
  items: OrderItem[];
  payment?: Payment | null;
  escrow?: EscrowTransaction | null;
  delivery?: Delivery | null;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface MarketPrice {
  id: string;
  categoryId: string;
  productName: string;
  state: string;
  avgPrice: string;
  unit: string;
  recordedAt: string;
}

export interface Conversation {
  id: string;
  listingId: string | null;
  otherParticipant: Pick<User, "id" | "profile">;
  lastMessage: Message | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: "ORDER" | "PAYMENT" | "ESCROW" | "DELIVERY" | "MESSAGE" | "REVIEW" | "SYSTEM" | "VERIFICATION";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// ---- API envelope, matches every Express response ----

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiFailure {
  success: false;
  message: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;