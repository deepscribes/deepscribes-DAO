import {
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  AttributeValue,
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

/**
 * Creates a transcription in the database
 * @requires process.env.DDB_TABLE_NAME
 * @param params - The transcription to create
 * @returns The created transcription, as well as the metadata from the request
 */
export async function createTranscription(params: CreateTranscriptionInput) {
  const transcriptionId = params.id || randomUUID();
  const createdAt = new Date().toISOString();

  const transcription = {
    id: transcriptionId,
    title: params.title,
    status: params.status,
    createdAt,
    userId: params.userId,
    transcriptionLength: params.transcriptionLength || 0,
  } as const as DDBTranscription;

  const item: Record<string, AttributeValue> = {
    id: { S: transcriptionId },
    title: { S: params.title },
    status: { S: params.status },
    createdAt: { S: createdAt },
    userId: { S: params.userId },
    transcriptionLength: {
      N: params.transcriptionLength?.toString() || "0",
    },
  };

  const res = await ddb.send(
    new PutItemCommand({ TableName: process.env.DDB_TABLE_NAME, Item: item })
  );

  return {
    transcription,
    $metadata: res.$metadata,
  };
}

/**
 * Gets a transcription by ID
 * @requires process.env.DDB_TABLE_NAME
 * @param id - The transcription ID to fetch
 * @returns The transcription if found, `null` otherwise
 */
export async function getTranscriptionById(
  id: TranscriptionId
): Promise<DDBTranscription | null> {
  const result = await ddb.send(
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
 * @requires process.env.DDB_TABLE_NAME
 * @param userId - The user ID to fetch transcriptions for
 * @returns
 */
export async function getAllUserTranscriptions(
  userId: string
): Promise<DDBTranscription[]> {
  const result = await ddb.send(
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
 * @requires process.env.DDB_TABLE_NAME
 * @param id The transcription id
 * @param title The new title
 * @returns
 */
export async function updateTranscriptionTitle(
  id: TranscriptionId,
  title: string
) {
  return await ddb.send(
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
 * @requires process.env.DDB_TABLE_NAME
 * @param id The transcription id
 * @param status The new status
 * @returns
 */
export async function updateTranscriptionStatus(
  id: TranscriptionId,
  status: TranscriptionStatus
) {
  return await ddb.send(
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
 * @requires process.env.DDB_TABLE_NAME
 * @param id The transcription id
 * @param duration The new duration
 * @returns
 */
export async function updateTranscriptionDuration(
  id: TranscriptionId,
  duration: number
) {
  return await ddb.send(
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
 * @requires process.env.DDB_TABLE_NAME
 * @param id The transcription id
 * @returns
 */
export async function deleteTranscription(id: TranscriptionId) {
  return await ddb.send(
    new DeleteItemCommand({
      TableName: process.env.DDB_TABLE_NAME,
      Key: { id: { S: id } },
    })
  );
}
