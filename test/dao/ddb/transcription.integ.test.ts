import {
  createTranscription,
  getTranscriptionById,
  getAllUserTranscriptions,
  updateTranscriptionTitle,
  deleteTranscription,
  updateTranscriptionStatus,
  updateTranscriptionDuration,
} from "../../../src/dao/ddb/transcriptions";
import { TranscriptionStatus } from "../../../src/models/transcription";
import {
  SAMPLE_TRANSCRIPTION,
  SAMPLE_USER_ID,
  SAMPLE_TRANSCRIPTION_TITLE,
  SAMPLE_ANOTHER_TRANSCRIPTION_TITLE,
} from "../../constants";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

afterAll(() => {
  // Cleanup the ddb table
  getAllUserTranscriptions(SAMPLE_USER_ID).then((items) => {
    if (items) {
      items.forEach(async (item) => {
        await deleteTranscription(item.id);
      });
    }
  });
});

describe("Transcription DAO", () => {
  it("creates a transcription", async () => {
    const result = await createTranscription(SAMPLE_TRANSCRIPTION);
    expect(result).toBeDefined();
    expect(result.transcription.id).toBeDefined();
    expect(result.transcription.userId).toBe(SAMPLE_USER_ID);
    expect(result.transcription.title).toBe(SAMPLE_TRANSCRIPTION_TITLE);
    expect(result.transcription.status).toBe(SAMPLE_TRANSCRIPTION.status);
    expect(result.transcription.createdAt).toBeDefined();
    expect(result.transcription.transcriptionLength).toBe(
      SAMPLE_TRANSCRIPTION.transcriptionLength
    );
    expect(result.$metadata.httpStatusCode).toBe(200);
  });

  it("fetches a transcription by ID", async () => {
    const res = await createTranscription(SAMPLE_TRANSCRIPTION);
    const result = await getTranscriptionById(res.transcription.id);
    expect(result).toBeDefined();
    expect(result!.id).toBe(res.transcription.id);
    expect(result!.userId).toBe(SAMPLE_USER_ID);
    expect(result!.title).toBe(SAMPLE_TRANSCRIPTION_TITLE);
    expect(result!.status).toBe(SAMPLE_TRANSCRIPTION.status);
  });

  it("returns null for a non-existent transcription ID", async () => {
    const result = await getTranscriptionById("non-existent-id");
    expect(result).toBeNull();
  });

  it("queries all transcriptions for a user", async () => {
    const res = await createTranscription(SAMPLE_TRANSCRIPTION);
    const items = await getAllUserTranscriptions(SAMPLE_USER_ID);
    expect(items?.length).toBeGreaterThan(0);

    const match = items.find((t) => t.id === res.transcription.id);
    expect(match).toBeDefined();
    expect(match!.title).toBe(SAMPLE_TRANSCRIPTION_TITLE);
  });

  it("updates the transcription title", async () => {
    const res = await createTranscription(SAMPLE_TRANSCRIPTION);
    const result = await updateTranscriptionTitle(
      res.transcription.id,
      SAMPLE_ANOTHER_TRANSCRIPTION_TITLE
    );
    expect(result.$metadata.httpStatusCode).toBe(200);

    await delay(100);

    const updated = await getTranscriptionById(res.transcription.id);
    expect(updated).toBeDefined();
    expect(updated!.title).toBe(SAMPLE_ANOTHER_TRANSCRIPTION_TITLE);
  });

  it("updates the transcription status", async () => {
    const res = await createTranscription(SAMPLE_TRANSCRIPTION);
    const result = await updateTranscriptionStatus(
      res.transcription.id,
      TranscriptionStatus.ERROR
    );
    expect(result.$metadata.httpStatusCode).toBe(200);

    const updated = await getTranscriptionById(res.transcription.id);
    expect(updated).toBeDefined();
    expect(updated!.status).toBe(TranscriptionStatus.ERROR);
  });

  it("updates the transcription length", async () => {
    const res = await createTranscription(SAMPLE_TRANSCRIPTION);
    const result = await updateTranscriptionDuration(res.transcription.id, 100);
    expect(result.$metadata.httpStatusCode).toBe(200);
    const updated = await getTranscriptionById(res.transcription.id);
    expect(updated).toBeDefined();
    expect(updated!.transcriptionLength).toBe(100);
  });

  it("deletes the transcription", async () => {
    const res = await createTranscription(SAMPLE_TRANSCRIPTION);
    delay(100);
    const items = await getAllUserTranscriptions(SAMPLE_USER_ID);
    expect(items?.length).toBeGreaterThan(0);
    const result = await deleteTranscription(res.transcription.id);
    expect(result.$metadata.httpStatusCode).toBe(200);
    expect(await getTranscriptionById(res.transcription.id)).toBeNull();
  });
});
