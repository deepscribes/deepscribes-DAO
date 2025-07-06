// tests/dao/subscription.test.ts

import { SubscriptionDao } from "../../../src/dao/ddb/subscriptions";
import { ddb } from "../../../src/utils/ddb";

import {
  SAMPLE_SUBSCRIPTION,
  SAMPLE_SUBSCRIPTION_ID,
  SAMPLE_SUBSCRIPTION_ITEM,
  SAMPLE_USER_ID,
  SAMPLE_SUBSCRIPTION_TABLE_NAME,
  SAMPLE_SUBSCRIPTION_FT,
} from "../../constants";

// Mock the ddb module
jest.mock("../../../src/utils/ddb", () => ({
  ddb: {
    send: jest.fn(),
  },
}));

const mockedSend = ddb.send as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SubscriptionDao Initialization", () => {
  test("should initialize with correct table name", () => {
    process.env.DDB_SUBSCRIPTIONS_TABLE_NAME = SAMPLE_SUBSCRIPTION_TABLE_NAME;
    const dao = new SubscriptionDao();
    expect(dao).toBeDefined();
  });

  test("should throw error if DDB_TABLE_NAME is not set", () => {
    delete process.env.DDB_SUBSCRIPTIONS_TABLE_NAME;
    expect(() => new SubscriptionDao()).toThrow(
      "Couldn't load DDB_SUBSCRIPTIONS_TABLE_NAME"
    );
  });
});

describe("SubscriptionDao Unit Tests", () => {
  process.env.DDB_SUBSCRIPTIONS_TABLE_NAME = SAMPLE_SUBSCRIPTION_TABLE_NAME;
  const dao = new SubscriptionDao();

  test("createSubscription should call PutItemCommand with correct params", async () => {
    mockedSend.mockResolvedValueOnce({ $metadata: { httpStatusCode: 200 } });

    const result = await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION.plan,
      SAMPLE_SUBSCRIPTION.expirationDate,
      SAMPLE_SUBSCRIPTION.isTrial
    );

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_SUBSCRIPTION_TABLE_NAME,
          Item: expect.objectContaining({
            id: { S: expect.any(String) },
            userId: { S: SAMPLE_USER_ID },
            plan: { S: SAMPLE_SUBSCRIPTION.plan },
            expirationDate: { S: SAMPLE_SUBSCRIPTION.expirationDate },
            createdAt: { S: expect.any(String) },
            updatedAt: { S: expect.any(String) },
            isTrial: { BOOL: SAMPLE_SUBSCRIPTION.isTrial },
          }),
        }),
      })
    );
    expect(result.subscription).toMatchObject({
      userId: SAMPLE_USER_ID,
      plan: SAMPLE_SUBSCRIPTION.plan,
      expirationDate: SAMPLE_SUBSCRIPTION.expirationDate,
      isTrial: SAMPLE_SUBSCRIPTION.isTrial,
    });
  });

  test("createSubscription should call PutItemCommand with correct params when with free trial", async () => {
    mockedSend.mockResolvedValueOnce({ $metadata: { httpStatusCode: 200 } });

    const result = await dao.createSubscription(
      SAMPLE_USER_ID,
      SAMPLE_SUBSCRIPTION_FT.plan,
      SAMPLE_SUBSCRIPTION_FT.expirationDate,
      SAMPLE_SUBSCRIPTION_FT.isTrial
    );

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_SUBSCRIPTION_TABLE_NAME,
          Item: expect.objectContaining({
            id: { S: expect.any(String) },
            userId: { S: SAMPLE_USER_ID },
            plan: { S: SAMPLE_SUBSCRIPTION_FT.plan },
            expirationDate: { S: SAMPLE_SUBSCRIPTION_FT.expirationDate },
            createdAt: { S: expect.any(String) },
            updatedAt: { S: expect.any(String) },
            isTrial: { BOOL: SAMPLE_SUBSCRIPTION_FT.isTrial },
          }),
        }),
      })
    );
    expect(result.subscription).toMatchObject({
      userId: SAMPLE_USER_ID,
      plan: SAMPLE_SUBSCRIPTION_FT.plan,
      expirationDate: SAMPLE_SUBSCRIPTION_FT.expirationDate,
      isTrial: SAMPLE_SUBSCRIPTION_FT.isTrial,
    });
  });

  test("getSubscriptionById should return unmarshalled item", async () => {
    mockedSend.mockResolvedValueOnce({ Item: SAMPLE_SUBSCRIPTION_ITEM });

    const result = await dao.getSubscriptionById(SAMPLE_SUBSCRIPTION_ID);

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          TableName: SAMPLE_SUBSCRIPTION_TABLE_NAME,
          Key: { id: { S: SAMPLE_SUBSCRIPTION_ID } },
        },
      })
    );
    expect(result).toEqual(SAMPLE_SUBSCRIPTION);
  });

  test("getSubscriptionById should return null if not found", async () => {
    mockedSend.mockResolvedValueOnce({});

    const result = await dao.getSubscriptionById(SAMPLE_SUBSCRIPTION_ID);
    expect(result).toBeNull();
  });

  test("getUserSubscriptions should return all subscriptions", async () => {
    mockedSend.mockResolvedValueOnce({ Items: [SAMPLE_SUBSCRIPTION_ITEM] });

    const result = await dao.getUserSubscriptions(SAMPLE_USER_ID);

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_SUBSCRIPTION_TABLE_NAME,
          IndexName: "SubscriptionUserIdIndex",
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": { S: SAMPLE_USER_ID },
          },
        }),
      })
    );

    expect(result).toEqual([SAMPLE_SUBSCRIPTION]);
  });

  test("getUserSubscriptions should return empty array if none found", async () => {
    mockedSend.mockResolvedValueOnce({ Items: [] });

    const result = await dao.getUserSubscriptions(SAMPLE_USER_ID);
    expect(result).toEqual([]);
  });

  test("getUserSubscriptions should return empty array if null returned", async () => {
    mockedSend.mockResolvedValueOnce({ Items: null });

    const result = await dao.getUserSubscriptions(SAMPLE_USER_ID);
    expect(result).toEqual([]);
  });

  test("deleteSubscription should call DeleteItemCommand", async () => {
    mockedSend.mockResolvedValueOnce({});

    await dao.deleteSubscription(SAMPLE_SUBSCRIPTION_ID);

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          TableName: SAMPLE_SUBSCRIPTION_TABLE_NAME,
          Key: { id: { S: SAMPLE_SUBSCRIPTION_ID } },
        },
      })
    );
  });

  test("deleteUserSubscriptions should delete all subscriptions", async () => {
    mockedSend
      .mockResolvedValueOnce({ Items: [SAMPLE_SUBSCRIPTION_ITEM] }) // getUserSubscriptions
      .mockResolvedValueOnce({}); // delete

    await dao.deleteUserSubscriptions(SAMPLE_USER_ID);

    expect(mockedSend).toHaveBeenCalledTimes(2);
    expect(mockedSend).toHaveBeenLastCalledWith(
      expect.objectContaining({
        input: {
          TableName: SAMPLE_SUBSCRIPTION_TABLE_NAME,
          Key: { id: { S: SAMPLE_SUBSCRIPTION.id } },
        },
      })
    );
  });
});
