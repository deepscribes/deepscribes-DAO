export type SubscriptionPlan = "free" | "solo" | "unlimited";

type ISO8061String = string; // ISO 8601 date string, e.g., "2023-10-01T12:00:00Z"
type UUIDv4 = string; // UUIDv4 string, e.g., "123e4567-e89b-12d3-a456-426614174000"

export type Subscription = {
  id: UUIDv4;
  userId: UUIDv4;
  plan: SubscriptionPlan;
  expirationDate: ISO8061String;
  createdAt: ISO8061String;
  updatedAt: ISO8061String;
  isTrial: boolean;
};
