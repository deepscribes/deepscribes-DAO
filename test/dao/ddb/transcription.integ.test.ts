import { TranscriptionDao } from "../../../src/dao/ddb/transcriptions";
import { TranscriptionStatus } from "../../../src/models/transcription";
import {
  SAMPLE_TRANSCRIPTION,
  SAMPLE_USER_ID,
  SAMPLE_TRANSCRIPTION_TITLE,
  SAMPLE_ANOTHER_TRANSCRIPTION_TITLE,
} from "../../constants";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

afterAll(() => {
  const transcriptionDao = new TranscriptionDao();
  // Cleanup the ddb table
  transcriptionDao.getAllUserTranscriptions(SAMPLE_USER_ID).then((items) => {
    if (items) {
      items.forEach(async (item) => {
        await transcriptionDao.deleteTranscription(item.id);
      });
    }
  });
});

describe("Transcription DAO", () => {
  const transcriptionDao = new TranscriptionDao();
  it("creates a transcription", async () => {
    const result = await transcriptionDao.createTranscription(
      SAMPLE_TRANSCRIPTION
    );
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
    const res = await transcriptionDao.createTranscription(
      SAMPLE_TRANSCRIPTION
    );
    const result = await transcriptionDao.getTranscriptionById(
      res.transcription.id
    );
    expect(result).toBeDefined();
    expect(result!.id).toBe(res.transcription.id);
    expect(result!.userId).toBe(SAMPLE_USER_ID);
    expect(result!.title).toBe(SAMPLE_TRANSCRIPTION_TITLE);
    expect(result!.status).toBe(SAMPLE_TRANSCRIPTION.status);
  });

  it("returns null for a non-existent transcription ID", async () => {
    const result = await transcriptionDao.getTranscriptionById(
      "non-existent-id"
    );
    expect(result).toBeNull();
  });

  it("queries all transcriptions for a user", async () => {
    const res = await transcriptionDao.createTranscription(
      SAMPLE_TRANSCRIPTION
    );
    const items = await transcriptionDao.getAllUserTranscriptions(
      SAMPLE_USER_ID
    );
    expect(items?.length).toBeGreaterThan(0);

    const match = items.find((t) => t.id === res.transcription.id);
    expect(match).toBeDefined();
    expect(match!.title).toBe(SAMPLE_TRANSCRIPTION_TITLE);
  });

  it("updates the transcription title", async () => {
    const res = await transcriptionDao.createTranscription(
      SAMPLE_TRANSCRIPTION
    );
    await transcriptionDao.updateTranscriptionTitle(
      res.transcription.id,
      SAMPLE_ANOTHER_TRANSCRIPTION_TITLE
    );

    await delay(100);

    const updated = await transcriptionDao.getTranscriptionById(
      res.transcription.id
    );
    expect(updated).toBeDefined();
    expect(updated!.title).toBe(SAMPLE_ANOTHER_TRANSCRIPTION_TITLE);
  });

  it("updates the transcription status", async () => {
    const res = await transcriptionDao.createTranscription(
      SAMPLE_TRANSCRIPTION
    );
    await transcriptionDao.updateTranscriptionStatus(
      res.transcription.id,
      TranscriptionStatus.ERROR
    );

    const updated = await transcriptionDao.getTranscriptionById(
      res.transcription.id
    );
    expect(updated).toBeDefined();
    expect(updated!.status).toBe(TranscriptionStatus.ERROR);
  });

  it("updates the transcription length", async () => {
    const res = await transcriptionDao.createTranscription(
      SAMPLE_TRANSCRIPTION
    );
    await transcriptionDao.updateTranscriptionDuration(
      res.transcription.id,
      100
    );
    const updated = await transcriptionDao.getTranscriptionById(
      res.transcription.id
    );
    expect(updated).toBeDefined();
    expect(updated!.transcriptionLength).toBe(100);
  });

  it("deletes the transcription", async () => {
    const res = await transcriptionDao.createTranscription(
      SAMPLE_TRANSCRIPTION
    );
    delay(100);
    const items = await transcriptionDao.getAllUserTranscriptions(
      SAMPLE_USER_ID
    );
    expect(items?.length).toBeGreaterThan(0);
    await transcriptionDao.deleteTranscription(res.transcription.id);
    expect(
      await transcriptionDao.getTranscriptionById(res.transcription.id)
    ).toBeNull();
  });
});
