// tests/dao/transcriptions.test.ts

import { TranscriptionDao } from "../../../src/dao/ddb/transcriptions";
import { TranscriptionStatus } from "../../../src/models/transcription";

import { ddb } from "../../../src/utils/ddb";

import {
  SAMPLE_TRANSCRIPTION,
  SAMPLE_TRANSCRIPTION_ID,
  SAMPLE_TRANSCRIPTION_ITEM,
  SAMPLE_USER_ID,
  SAMPLE_ANOTHER_TRANSCRIPTION_TITLE,
  SAMPLE_TRANSCRIPTION_TABLE_NAME,
  SAMPLE_TRANSCRIPTION_LENGTH,
} from "../../constants";

// Mock the whole ddb module
jest.mock("../../../src/utils/ddb", () => ({
  ddb: {
    send: jest.fn(),
  },
}));

const mockedSend = ddb.send as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TranscriptionDao Initialization", () => {
  test("should initialize with correct table name", () => {
    process.env.DDB_TABLE_NAME = SAMPLE_TRANSCRIPTION_TABLE_NAME;
    const transcriptionDao = new TranscriptionDao();
    expect(transcriptionDao).toBeDefined();
  });
  test("should throw error if DDB_TABLE_NAME is not set", () => {
    delete process.env.DDB_TABLE_NAME;
    expect(() => new TranscriptionDao()).toThrow(
      "Couldn't load DDB_TABLE_NAME"
    );
  });
});

describe("Transcriptions DAO Unit Tests", () => {
  process.env.DDB_TABLE_NAME = SAMPLE_TRANSCRIPTION_TABLE_NAME;
  const transcriptionDao = new TranscriptionDao();
  test("createTranscription should call PutItemCommand with correct params", async () => {
    mockedSend.mockResolvedValueOnce({});

    await transcriptionDao.createTranscription({
      title: SAMPLE_TRANSCRIPTION.title,
      status: SAMPLE_TRANSCRIPTION.status,
      userId: SAMPLE_TRANSCRIPTION.userId,
      id: SAMPLE_TRANSCRIPTION_ID,
      transcriptionLength: SAMPLE_TRANSCRIPTION_LENGTH,
    });

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_TRANSCRIPTION_TABLE_NAME,
          Item: expect.objectContaining({
            id: { S: SAMPLE_TRANSCRIPTION_ID },
            title: { S: SAMPLE_TRANSCRIPTION.title },
            status: { S: SAMPLE_TRANSCRIPTION.status },
            userId: { S: SAMPLE_TRANSCRIPTION.userId },
            transcriptionLength: { N: SAMPLE_TRANSCRIPTION_LENGTH.toString() },
            createdAt: { S: expect.any(String) }, // createdAt is generated
          }),
        }),
      })
    );
  });

  test("createTranscription should call PutItemCommand with correct params when no length", async () => {
    mockedSend.mockResolvedValueOnce({});

    await transcriptionDao.createTranscription({
      title: SAMPLE_TRANSCRIPTION.title,
      status: SAMPLE_TRANSCRIPTION.status,
      userId: SAMPLE_TRANSCRIPTION.userId,
      id: SAMPLE_TRANSCRIPTION_ID,
    });

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_TRANSCRIPTION_TABLE_NAME,
          Item: expect.objectContaining({
            id: { S: SAMPLE_TRANSCRIPTION_ID },
            title: { S: SAMPLE_TRANSCRIPTION.title },
            status: { S: SAMPLE_TRANSCRIPTION.status },
            userId: { S: SAMPLE_TRANSCRIPTION.userId },
            transcriptionLength: { N: "0" }, // default length is 0
            createdAt: { S: expect.any(String) }, // createdAt is generated
          }),
        }),
      })
    );
  });

  test("createTranscription should call PutItemCommand and create an id if not present", async () => {
    mockedSend.mockResolvedValueOnce({});

    await transcriptionDao.createTranscription({
      title: SAMPLE_TRANSCRIPTION.title,
      status: SAMPLE_TRANSCRIPTION.status,
      userId: SAMPLE_TRANSCRIPTION.userId,
    });

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_TRANSCRIPTION_TABLE_NAME,
          Item: expect.objectContaining({
            id: { S: expect.any(String) }, // id is generated
            title: { S: SAMPLE_TRANSCRIPTION.title },
            status: { S: SAMPLE_TRANSCRIPTION.status },
            userId: { S: SAMPLE_TRANSCRIPTION.userId },
          }),
        }),
      })
    );
  });

  test("getTranscriptionById should call GetItemCommand and return item", async () => {
    mockedSend.mockResolvedValueOnce({ Item: SAMPLE_TRANSCRIPTION_ITEM });

    const result = await transcriptionDao.getTranscriptionById(
      SAMPLE_TRANSCRIPTION_ID
    );

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          TableName: "transcriptions",
          Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
        },
      })
    );
    expect(result).toEqual(SAMPLE_TRANSCRIPTION);
  });

  test("getTranscriptionById should return null if item not found", async () => {
    mockedSend.mockResolvedValueOnce({});

    const result = await transcriptionDao.getTranscriptionById(
      SAMPLE_TRANSCRIPTION_ID
    );

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          TableName: "transcriptions",
          Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
        },
      })
    );
    expect(result).toBeNull();
  });

  test("getAllUserTranscriptions should call QueryCommand and return items", async () => {
    mockedSend.mockResolvedValueOnce({ Items: [SAMPLE_TRANSCRIPTION_ITEM] });

    const result = await transcriptionDao.getAllUserTranscriptions(
      SAMPLE_USER_ID
    );

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: "transcriptions",
          IndexName: expect.any(String),
          KeyConditionExpression: "userId = :uid",
          ExpressionAttributeValues: {
            ":uid": { S: SAMPLE_USER_ID },
          },
        }),
      })
    );

    expect(result).toEqual([SAMPLE_TRANSCRIPTION]);
  });

  test("updateTranscriptionTitle should call UpdateItemCommand with correct title update", async () => {
    mockedSend.mockResolvedValueOnce({});

    await transcriptionDao.updateTranscriptionTitle(
      SAMPLE_TRANSCRIPTION_ID,
      SAMPLE_ANOTHER_TRANSCRIPTION_TITLE
    );

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_TRANSCRIPTION_TABLE_NAME,
          Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
          UpdateExpression: "SET #title = :title",
          ExpressionAttributeNames: { "#title": "title" },
          ExpressionAttributeValues: {
            ":title": { S: SAMPLE_ANOTHER_TRANSCRIPTION_TITLE },
          },
        }),
      })
    );
  });

  test("updateTranscriptionStatus should call UpdateItemCommand with correct status update", async () => {
    mockedSend.mockResolvedValueOnce({});
    const newStatus = TranscriptionStatus.READY;
    await transcriptionDao.updateTranscriptionStatus(
      SAMPLE_TRANSCRIPTION_ID,
      newStatus
    );

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_TRANSCRIPTION_TABLE_NAME,
          Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
          UpdateExpression: "SET #status = :status",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: { ":status": { S: newStatus } },
        }),
      })
    );
  });

  test("updateTranscriptionLength should call UpdateItemCommand with correct length update", async () => {
    mockedSend.mockResolvedValueOnce({});
    const newLength = 120.5;
    await transcriptionDao.updateTranscriptionDuration(
      SAMPLE_TRANSCRIPTION_ID,
      newLength
    );

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_TRANSCRIPTION_TABLE_NAME,
          Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
          UpdateExpression: "SET #transcriptionLength = :transcriptionLength",
          ExpressionAttributeNames: {
            "#transcriptionLength": "transcriptionLength",
          },
          ExpressionAttributeValues: {
            ":transcriptionLength": { N: newLength.toString() },
          },
        }),
      })
    );
  });

  test("updateTranscriptionRefinementPrompt should call UpdateItemCommand with correct prompt update", async () => {
    mockedSend.mockResolvedValueOnce({});
    const newPrompt = "New refinement prompt";
    await transcriptionDao.updateTranscriptionRefinementPrompt(
      SAMPLE_TRANSCRIPTION_ID,
      newPrompt
    );

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_TRANSCRIPTION_TABLE_NAME,
          Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
          UpdateExpression: "SET #refinementPrompt = :prompt",
          ExpressionAttributeNames: { "#refinementPrompt": "refinementPrompt" },
          ExpressionAttributeValues: {
            ":prompt": { S: newPrompt },
          },
        }),
      })
    );
  });

  test("deleteTranscription should call DeleteItemCommand with correct key", async () => {
    mockedSend.mockResolvedValueOnce({});

    await transcriptionDao.deleteTranscription(SAMPLE_TRANSCRIPTION_ID);

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          TableName: SAMPLE_TRANSCRIPTION_TABLE_NAME,
          Key: { id: { S: SAMPLE_TRANSCRIPTION_ID } },
        }),
      })
    );
  });
});
