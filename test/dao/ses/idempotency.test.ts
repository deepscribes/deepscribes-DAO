import {
  checkIdempotency,
  createIdempotency,
} from "../../../src/dao/ddb/emails";

import { ddb } from "../../../src/utils/ddb";

beforeEach(() => {
  process.env.DDB_IDEMPOTENCY_TABLE_NAME = "mock-idempotency-table";
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Idempotency", () => {
  it("should create an idempotency key", async () => {
    // @ts-expect-error
    const mockPutItem = jest.spyOn(ddb, "send").mockResolvedValue({});

    const id = "test-idempotency-key";
    await createIdempotency(id);

    expect(mockPutItem).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: process.env.DDB_IDEMPOTENCY_TABLE_NAME,
          Item: expect.objectContaining({
            id: { S: id },
          }),
        }),
      }),
    );
  });

  it("should check if an idempotency key exists", async () => {
    // @ts-expect-error
    const mockGetItem = jest.spyOn(ddb, "send").mockResolvedValue({});

    const id = "test-idempotency-key";
    await checkIdempotency(id);

    expect(mockGetItem).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: process.env.DDB_IDEMPOTENCY_TABLE_NAME,
          Key: expect.objectContaining({
            id: { S: id },
          }),
        }),
      }),
    );
  });
});
