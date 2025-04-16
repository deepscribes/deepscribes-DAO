// tests/dao/transcriptions.test.ts
import {
  createTranscription,
  getTranscriptionById,
  getAllUserTranscriptions,
  deleteTranscription,
  updateTranscriptionTitle,
} from "../../../src/dao/ddb/transcriptions";
import { ddb } from "../../../src/utils/ddb";
import {
  SAMPLE_ANOTHER_TRANSCRIPTION_TITLE,
  SAMPLE_TRANSCRIPTION,
  SAMPLE_TRANSCRIPTION_ID,
  SAMPLE_TRANSCRIPTION_ITEM,
} from "../../constants";

jest.mock("../../../src/utils/ddb");

beforeEach(() => {
  process.env.DDB_TABLE_NAME = "transcriptions";
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Transcriptions DAO", () => {
  test("should create a transcription", async () => {
    (ddb.send as jest.Mock).mockResolvedValueOnce({});

    await createTranscription(SAMPLE_TRANSCRIPTION);

    expect(ddb.send).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: process.env.DDB_TABLE_NAME,
        Item: {
          title: { S: SAMPLE_TRANSCRIPTION.title },
          status: { S: SAMPLE_TRANSCRIPTION.status },
          userId: { S: SAMPLE_TRANSCRIPTION.userId },
        },
      }),
    );
  });

  test("should retrieve a transcription", async () => {
    (ddb.send as jest.Mock).mockResolvedValueOnce({
      Item: SAMPLE_TRANSCRIPTION_ITEM,
    });

    const result = await getTranscriptionById(SAMPLE_TRANSCRIPTION_ID);

    expect(ddb.send).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: process.env.DDB_TABLE_NAME,
        Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
      }),
    );
    expect(result).toEqual(SAMPLE_TRANSCRIPTION_ITEM);
  });

  test("should update a transcription", async () => {
    (ddb.send as jest.Mock).mockResolvedValueOnce({});

    await updateTranscriptionTitle(
      SAMPLE_TRANSCRIPTION_ID,
      SAMPLE_ANOTHER_TRANSCRIPTION_TITLE,
    );

    expect(ddb.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          TableName: expect.any(String),
          Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
          UpdateExpression: expect.stringContaining("title"),
        },
      }),
    );
  });

  test("should delete a transcription", async () => {
    (ddb.send as jest.Mock).mockResolvedValueOnce({});

    await deleteTranscription(SAMPLE_TRANSCRIPTION_ID);

    expect(ddb.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: expect.any(String),
          Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
        }),
      }),
    );
  });
});
