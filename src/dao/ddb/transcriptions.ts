import {
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  AttributeValue,
  DynamoDBClient,
  DynamoDBClientConfig,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import { ddb } from "../../utils/ddb";
import {
  DDBTranscription,
  TranscriptionId,
  TranscriptionStatus,
} from "../../models/transcription";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export type CreateTranscriptionInput = Omit<
  DDBTranscription,
  "id" | "createdAt" | "transcriptionLength"
> & {
  id?: TranscriptionId | undefined;
  transcriptionLength?: number | undefined;
};

export class TranscriptionDao {
  private ddbClient: DynamoDBClient;
  private tableName: string;
  constructor(ddbConfig?: DynamoDBClientConfig) {
    this.ddbClient = ddb;
    if (!process.env.DDB_TABLE_NAME) {
      throw new Error("Couldn't load DDB_TABLE_NAME");
    }
    this.tableName = process.env.DDB_TABLE_NAME;
  }

  /**
   * Creates a transcription in the database
   * @param params - The transcription to create
   * @returns The created transcription, as well as the metadata from the request
   */
  public async createTranscription(params: CreateTranscriptionInput): Promise<{
    transcription: DDBTranscription;
    $metadata: Record<any, any>;
  }> {
    const transcriptionId = params.id || randomUUID();
    const createdAt = new Date().toISOString();

    const transcription = {
      id: transcriptionId,
      title: params.title,
      status: params.status,
      createdAt,
      userId: params.userId,
      audioExtension: params.audioExtension,
      transcriptionLength: params.transcriptionLength || 0,
    } as const as DDBTranscription;

    const item: Record<string, AttributeValue> = {
      id: { S: transcriptionId },
      title: { S: params.title },
      status: { S: params.status },
      createdAt: { S: createdAt },
      userId: { S: params.userId },
      audioExtension: { S: params.audioExtension },
      transcriptionLength: {
        N: params.transcriptionLength?.toString() || "0",
      },
    };

    const res = await this.ddbClient.send(
      new PutItemCommand({
        TableName: process.env.DDB_TABLE_NAME,
        Item: item,
      })
    );

    return {
      transcription,
      $metadata: res.$metadata,
    };
  }

  /**
   * Gets a transcription by ID
   * @param id - The transcription ID to fetch
   * @returns The transcription if found, `null` otherwise
   */
  public async getTranscriptionById(
    id: TranscriptionId
  ): Promise<DDBTranscription | null> {
    const result = await this.ddbClient.send(
      new GetItemCommand({
        TableName: process.env.DDB_TABLE_NAME,
        Key: { id: { S: id } },
      })
    );
    if (!result.Item) {
      return null;
    }
    return unmarshall(result.Item) as DDBTranscription;
  }

  /**
   * Retrieves all transcriptions for a user
   * @param userId - The user ID to fetch transcriptions for
   * @returns An array of transcriptions
   */
  public async getAllUserTranscriptions(
    userId: string
  ): Promise<DDBTranscription[]> {
    const result = await this.ddbClient.send(
      new QueryCommand({
        TableName: process.env.DDB_TABLE_NAME,
        // Sync with CDK
        IndexName: "TranscriptionUserIdIndex",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": { S: userId },
        },
      })
    );
    return result.Items.map((e) => unmarshall(e)) as DDBTranscription[];
  }

  /**
   * Updates the title of a transcription
   * @param id - The transcription ID to update
   * @param title - The new title
   */
  public async updateTranscriptionTitle(
    id: TranscriptionId,
    title: string
  ): Promise<void> {
    await this.ddbClient.send(
      new UpdateItemCommand({
        TableName: process.env.DDB_TABLE_NAME,
        Key: { id: { S: id } },
        UpdateExpression: "SET #title = :title",
        ExpressionAttributeNames: { "#title": "title" },
        ExpressionAttributeValues: { ":title": { S: title } },
      })
    );
  }

  /**
   * Updates the status of a transcription
   * @param id - The transcription ID to update
   * @param status - The new status
   */
  public async updateTranscriptionStatus(
    id: TranscriptionId,
    status: TranscriptionStatus
  ): Promise<void> {
    await this.ddbClient.send(
      new UpdateItemCommand({
        TableName: process.env.DDB_TABLE_NAME,
        Key: { id: { S: id } },
        UpdateExpression: "SET #status = :status",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": { S: status } },
      })
    );
  }

  /**
   * Updates the duration of a transcription
   * @param id - The transcription ID to update
   * @param duration - The new duration
   */
  public async updateTranscriptionDuration(
    id: TranscriptionId,
    duration: number
  ): Promise<void> {
    await this.ddbClient.send(
      new UpdateItemCommand({
        TableName: process.env.DDB_TABLE_NAME,
        Key: { id: { S: id } },
        UpdateExpression: "SET #transcriptionLength = :transcriptionLength",
        ExpressionAttributeNames: {
          "#transcriptionLength": "transcriptionLength",
        },
        ExpressionAttributeValues: {
          ":transcriptionLength": { N: duration.toString() },
        },
      })
    );
  }

  /**
   * Deletes a transcription
   * @param id - The transcription ID to delete
   * @returns The result of the delete operation
   */
  public async deleteTranscription(id: TranscriptionId) {
    return await this.ddbClient.send(
      new DeleteItemCommand({
        TableName: process.env.DDB_TABLE_NAME,
        Key: { id: { S: id } },
      })
    );
  }
}
