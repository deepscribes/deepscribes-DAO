import { SubscriptionDao } from "../../../src/dao/ddb/subscriptions";
import { SubscriptionPlan } from "../../../src/models/subscription";
import { SAMPLE_SUBSCRIPTION, SAMPLE_USER_ID } from "../../constants";

const SAMPLE_SUBSCRIPTION_PLAN = SAMPLE_SUBSCRIPTION.plan;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe("SubscriptionDao Integration", () => {
  const dao = new SubscriptionDao();

  afterAll(async () => {
    const subs = await dao.getUserSubscriptions(SAMPLE_USER_ID);
    for (const sub of subs) {
      await dao.deleteSubscription(sub.id);
    }
  });

  it("creates a subscription", async () => {
    const result = await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_PLAN,
      SAMPLE_SUBSCRIPTION.status,
      SAMPLE_SUBSCRIPTION.expirationDate,
      SAMPLE_SUBSCRIPTION.isTrial
    );

    expect(result).toBeDefined();
    expect(result.subscription.id).toBeDefined();
    expect(result.subscription.userId).toBe(SAMPLE_USER_ID);
    expect(result.subscription.plan).toBe(SAMPLE_SUBSCRIPTION_PLAN);
    expect(result.subscription.expirationDate).toBe(
      SAMPLE_SUBSCRIPTION.expirationDate
    );
    expect(result.subscription.createdAt).toBeDefined();
    expect(result.subscription.updatedAt).toBeDefined();
    expect(result.subscription.isTrial).toBe(SAMPLE_SUBSCRIPTION.isTrial);
    expect(result.$metadata.httpStatusCode).toBe(200);
  });

  it("fetches a subscription by ID", async () => {
    const { subscription } = await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_PLAN,
      SAMPLE_SUBSCRIPTION.status,
      SAMPLE_SUBSCRIPTION.expirationDate,
      SAMPLE_SUBSCRIPTION.isTrial
    );

    const result = await dao.getSubscriptionById(subscription.id);
    expect(result).toBeDefined();
    expect(result!.id).toBe(subscription.id);
    expect(result!.userId).toBe(SAMPLE_USER_ID);
    expect(result!.plan).toBe(SAMPLE_SUBSCRIPTION_PLAN);
    expect(result!.expirationDate).toBe(SAMPLE_SUBSCRIPTION.expirationDate);
    expect(result!.createdAt).toBeDefined();
    expect(result!.updatedAt).toBeDefined();
    expect(result!.isTrial).toBe(SAMPLE_SUBSCRIPTION.isTrial);
    expect(result!.status).toBe(SAMPLE_SUBSCRIPTION.status);
  });

  it("returns null for non-existent subscription ID", async () => {
    const result = await dao.getSubscriptionById("non-existent-id");
    expect(result).toBeNull();
  });

  it("returns all active subscriptions for a user", async () => {
    const created = await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_PLAN,
      SAMPLE_SUBSCRIPTION.status,
      SAMPLE_SUBSCRIPTION.expirationDate,
      SAMPLE_SUBSCRIPTION.isTrial
    );

    await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_PLAN,
      SAMPLE_SUBSCRIPTION.status,
      SAMPLE_SUBSCRIPTION.expirationDate,
      SAMPLE_SUBSCRIPTION.isTrial
    );

    const expiredSubscription = await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_PLAN,
      "expired",
      SAMPLE_SUBSCRIPTION.expirationDate,
      SAMPLE_SUBSCRIPTION.isTrial
    );

    const results = await dao.getUserSubscriptions(SAMPLE_USER_ID);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((s) => s.status === "active")).toBe(true);
    expect(
      results.filter((s) => s.id === expiredSubscription.subscription.id)
    ).toHaveLength(0);

    const match = results.find((s) => s.id === created.subscription.id);
    expect(match).toBeDefined();
    expect(match!.userId).toBe(SAMPLE_USER_ID);
  });

  it("correctly updates a subscription", async () => {
    const { subscription } = await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_PLAN,
      SAMPLE_SUBSCRIPTION.status,
      SAMPLE_SUBSCRIPTION.expirationDate,
      SAMPLE_SUBSCRIPTION.isTrial
    );

    const updated = await dao.updateSubscription(subscription.id, {
      plan: "unlimited" as SubscriptionPlan,
    });

    expect(updated).toBeDefined();
    expect(updated.subscription.id).toBe(subscription.id);
    expect(updated.subscription.plan).toBe("unlimited");
    expect(updated.subscription.updatedAt).toBeDefined();
    expect(updated.subscription.createdAt).toBe(subscription.createdAt);
  });

  it("deletes a subscription", async () => {
    const { subscription } = await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_PLAN,
      SAMPLE_SUBSCRIPTION.status,
      SAMPLE_SUBSCRIPTION.expirationDate,
      SAMPLE_SUBSCRIPTION.isTrial
    );

    await delay(100);

    await dao.deleteSubscription(subscription.id);

    const result = await dao.getSubscriptionById(subscription.id);
    expect(result).toBeNull();
  });

  it("deletes all user subscriptions", async () => {
    // Create two subscriptions
    await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_PLAN,
      SAMPLE_SUBSCRIPTION.status,
      SAMPLE_SUBSCRIPTION.expirationDate
    );
    await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_PLAN,
      SAMPLE_SUBSCRIPTION.status,
      SAMPLE_SUBSCRIPTION.expirationDate
    );

    await dao.deleteUserSubscriptions(SAMPLE_USER_ID);
    const remaining = await dao.getUserSubscriptions(SAMPLE_USER_ID);
    expect(remaining).toEqual([]);
  });
});
