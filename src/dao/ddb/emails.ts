import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { ddb } from "../../utils/ddb";

/**
 * Check if an idempotency key already exists in the database
 * @requires process.env.DDB_IDEMPOTENCY_TABLE_NAME
 * @param id - The idempotency key to check
 * @returns
 */
export async function checkIdempotency(id: string) {
  const result = await ddb.send(
    new GetItemCommand({
      TableName: process.env.DDB_IDEMPOTENCY_TABLE_NAME,
      Key: { id: { S: id } },
    }),
  );
  return result.Item;
}

/**
 * Create an idempotency key in the database
 * @requires process.env.DDB_IDEMPOTENCY_TABLE_NAME
 * @param id - The idempotency key to create
 * @returns
 */
export async function createIdempotency(id: string) {
  const item = {
    id: { S: id },
    ttl: { N: (Math.floor(Date.now() / 1000) + 60 * 60 * 24).toString() }, // 1 day
  };
  const res = await ddb.send(
    new PutItemCommand({
      TableName: process.env.DDB_IDEMPOTENCY_TABLE_NAME,
      Item: item,
    }),
  );
  return res;
}
