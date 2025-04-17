import {
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  DeleteItemCommand,
  UpdateItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "node:crypto";
import { ddb } from "../../utils/ddb";
import { DDBTranscription } from "../../models/transcription";

export type CreateTranscriptionInput = Omit<
  DDBTranscription,
  "id" | "createdAt"
>;

export async function createTranscription(params: CreateTranscriptionInput) {
  const transcriptionId = randomUUID();
  const createdAt = new Date().toISOString();

  const transcription = {
    id: transcriptionId,
    title: params.title,
    status: params.status,
    createdAt,
    userId: params.userId,
  } as const;

  const item: Record<string, AttributeValue> = {
    id: { S: transcriptionId },
    title: { S: params.title },
    status: { S: params.status },
    createdAt: { S: createdAt },
    userId: { S: params.userId },
  };

  const res = await ddb.send(
    new PutItemCommand({ TableName: process.env.DDB_TABLE_NAME, Item: item }),
  );

  return {
    transcription,
    $metadata: res.$metadata,
  };
}

export async function getTranscriptionById(id: DDBTranscription["id"]) {
  const result = await ddb.send(
    new GetItemCommand({
      TableName: process.env.DDB_TABLE_NAME,
      Key: { id: { S: id } },
    }),
  );
  return result.Item;
}

export async function getAllUserTranscriptions(
  userId: DDBTranscription["userId"],
) {
  const result = await ddb.send(
    new QueryCommand({
      TableName: process.env.DDB_TABLE_NAME,
      // Sync with CDK
      IndexName: "TranscriptionUserIdIndex",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId },
      },
    }),
  );
  return result.Items;
}

export async function updateTranscriptionTitle(id: string, title: string) {
  return ddb.send(
    new UpdateItemCommand({
      TableName: process.env.DDB_TABLE_NAME,
      Key: { id: { S: id } },
      UpdateExpression: "SET #title = :title",
      ExpressionAttributeNames: { "#title": "title" },
      ExpressionAttributeValues: { ":title": { S: title } },
    }),
  );
}

export async function deleteTranscription(id: string) {
  return ddb.send(
    new DeleteItemCommand({
      TableName: process.env.DDB_TABLE_NAME,
      Key: { id: { S: id } },
    }),
  );
}
