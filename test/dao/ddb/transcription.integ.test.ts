import {
  createTranscription,
  getTranscriptionById,
  getAllUserTranscriptions,
  updateTranscriptionTitle,
  deleteTranscription,
} from "../../../src/dao/ddb/transcriptions";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import {
  SAMPLE_TRANSCRIPTION,
  SAMPLE_USER_ID,
  SAMPLE_TRANSCRIPTION_TITLE,
  SAMPLE_ANOTHER_TRANSCRIPTION_TITLE,
} from "../../constants";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe("Transcription DAO", () => {
  let createdId: string;

  it("creates a transcription", async () => {
    const result = await createTranscription({
      title: SAMPLE_TRANSCRIPTION_TITLE,
      status: SAMPLE_TRANSCRIPTION.status,
      userId: SAMPLE_USER_ID,
    });

    expect(result.$metadata.httpStatusCode).toBe(200);
  });

  it("fetches a transcription by ID", async () => {
    await createTranscription({
      title: SAMPLE_TRANSCRIPTION_TITLE,
      status: SAMPLE_TRANSCRIPTION.status,
      userId: SAMPLE_USER_ID,
    });

    // Just grab any transcription for the user to verify
    await delay(100);
    const all = await getAllUserTranscriptions(SAMPLE_USER_ID);
    const match = all
      ?.map((e) => unmarshall(e))
      .find((t) => t.title === SAMPLE_TRANSCRIPTION_TITLE);

    expect(match).toBeDefined();
    createdId = match!.id;

    const result = await getTranscriptionById(createdId);
    expect(result).toBeDefined();

    const unmarshalled = unmarshall(result!);
    expect(unmarshalled.id).toBe(createdId);
    expect(unmarshalled.userId).toBe(SAMPLE_USER_ID);
    expect(unmarshalled.title).toBe(SAMPLE_TRANSCRIPTION_TITLE);
    expect(unmarshalled.status).toBe(SAMPLE_TRANSCRIPTION.status);
  });

  it("queries all transcriptions for a user", async () => {
    await delay(100);
    const items = await getAllUserTranscriptions(SAMPLE_USER_ID);
    expect(items?.length).toBeGreaterThan(0);

    const list = items!.map((e) => unmarshall(e));
    const match = list.find((t) => t.id === createdId);
    expect(match).toBeDefined();
    expect(match!.title).toBe(SAMPLE_TRANSCRIPTION_TITLE);
  });

  it("updates the transcription title", async () => {
    const result = await updateTranscriptionTitle(
      createdId,
      SAMPLE_ANOTHER_TRANSCRIPTION_TITLE,
    );
    expect(result.$metadata.httpStatusCode).toBe(200);

    await delay(100);

    const updated = await getTranscriptionById(createdId);
    const unmarshalled = unmarshall(updated!);
    expect(unmarshalled.title).toBe(SAMPLE_ANOTHER_TRANSCRIPTION_TITLE);
  });

  it("updates the transcription status", async () => {
    const result = await updateTranscriptionTitle(
      createdId,
      SAMPLE_TRANSCRIPTION.status,
    );
    expect(result.$metadata.httpStatusCode).toBe(200);

    await delay(100);

    const updated = await getTranscriptionById(createdId);
    const unmarshalled = unmarshall(updated!);
    expect(unmarshalled.status).toBe(SAMPLE_TRANSCRIPTION.status);
  });

  it("deletes the transcription", async () => {
    const result = await deleteTranscription(createdId);
    expect(result.$metadata.httpStatusCode).toBe(200);

    await delay(100);

    const deleted = await getTranscriptionById(createdId);
    expect(deleted).toBeUndefined();
  });
});
