import {
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  DeleteItemCommand,
  AttributeValue,
  type DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import { ddb } from "../../utils/ddb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../../models/subscription";

export class SubscriptionDao {
  private ddbClient: DynamoDBClient;
  private tableName: string;
  constructor() {
    this.ddbClient = ddb;
    if (!process.env.DDB_SUBSCRIPTIONS_TABLE_NAME) {
      throw new Error("Couldn't load DDB_SUBSCRIPTIONS_TABLE_NAME");
    }
    this.tableName = process.env.DDB_SUBSCRIPTIONS_TABLE_NAME;
    console.debug(`Using table: ${this.tableName}`);
  }

  public async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    status: SubscriptionStatus,
    expirationDate: string,
    isTrial: boolean = false,
    subscriptionId?: string
  ) {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const id = subscriptionId || randomUUID();

    const subscription: Subscription = {
      id,
      userId,
      plan,
      status,
      expirationDate,
      createdAt,
      updatedAt,
      isTrial,
    };

    const item = marshall(subscription, {
      removeUndefinedValues: true,
    });

    const res = await this.ddbClient.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: item,
      })
    );

    return {
      subscription,
      $metadata: res.$metadata,
    };
  }

  public async updateSubscription(
    subscriptionId: string,
    newSubscription: Partial<
      Omit<Subscription, "id" | "createdAt" | "updatedAt">
    >
  ) {
    const oldSubscription = await this.getSubscriptionById(subscriptionId);
    const updatedAt = oldSubscription?.updatedAt || new Date().toISOString();

    const subscription: Subscription = {
      id: subscriptionId,
      userId: newSubscription.userId ?? oldSubscription.userId,
      plan: newSubscription.plan ?? oldSubscription.plan,
      status: newSubscription.status ?? oldSubscription.status,
      expirationDate:
        newSubscription.expirationDate ?? oldSubscription.expirationDate,
      createdAt: oldSubscription.createdAt,
      updatedAt,
      isTrial: newSubscription.isTrial ?? oldSubscription.isTrial,
    };

    const item = marshall(subscription, {
      removeUndefinedValues: true,
    });

    const res = await this.ddbClient.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: item,
      })
    );

    return {
      subscription,
      $metadata: res.$metadata,
    };
  }

  public async getSubscriptionById(id: string): Promise<Subscription | null> {
    const result = await this.ddbClient.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: { id: { S: id } },
      })
    );
    if (!result.Item) {
      return null;
    }
    return unmarshall(result.Item) as Subscription;
  }

  public async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const result = await this.ddbClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "SubscriptionUserIdIndex",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "#transcription_status = :status",
        ExpressionAttributeValues: {
          ":userId": { S: userId },
          ":status": { S: "active" as SubscriptionStatus },
        },
        ExpressionAttributeNames: {
          "#transcription_status": "status",
        },
      })
    );

    if (!result.Items) {
      return [];
    }

    return result.Items.map((item) => unmarshall(item) as Subscription);
  }

  /**
   * NOT TO BE USED IN PRODUCTION
   * Deletes a subscription by ID
   * This method is intended for testing purposes only.
   * @param id - The subscription ID to delete
   */
  public async deleteSubscription(id: string): Promise<void> {
    await this.ddbClient.send(
      new DeleteItemCommand({
        TableName: this.tableName,
        Key: { id: { S: id } },
      })
    );
  }

  /**
   * NOT TO BE USED IN PRODUCTION
   * Deletes all subscriptions for a user
   * This method is intended for testing purposes only.
   * @param userId - The user ID whose subscriptions to delete
   */
  public async deleteUserSubscriptions(userId: string): Promise<void> {
    const subscriptions = await this.getUserSubscriptions(userId);
    await Promise.all(
      subscriptions.map((sub) => {
        return this.ddbClient.send(
          new DeleteItemCommand({
            TableName: this.tableName,
            Key: { id: { S: sub.id } },
          })
        );
      })
    );
  }
}
