import {
  MOCK_AUDIO_BUCKET_NAME,
  MOCK_TRANSCRIPTION_TEMP_BUCKET_NAME,
  MOCK_TRANSCRIPTIONS_BUCKET_NAME,
} from "../../constants";

process.env.AWS_BUCKET_NAME = MOCK_AUDIO_BUCKET_NAME;
process.env.TRANSCRIPTION_TEMP_BUCKET_NAME =
  MOCK_TRANSCRIPTION_TEMP_BUCKET_NAME;
process.env.TRANSCRIPTIONS_BUCKET_NAME = MOCK_TRANSCRIPTIONS_BUCKET_NAME;

import {
  getRawAudioUrl,
  putRawAudioUrl,
  getOptimizedAudioUrl,
  putOptimizedAudioUrl,
  getRawTranscriptionUrl,
  putRawTranscriptionUrl,
  getFinalTranscriptionUrl,
  putFinalTranscriptionUrl,
  createSignedUrl,
  putOptimizedAudioChunkUrl,
  getOptimizedAudioChunkUrl,
  putRawTranscriptionChunkUrl,
  getRawTranscriptionChunkUrl,
} from "../../../src/dao/s3/audio";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(),
  GetObjectCommand: jest.fn(),
  PutObjectCommand: jest.fn(),
}));

const mockGetSignedUrl = getSignedUrl as jest.Mock;

beforeEach(() => {
  const signedUrl = "https://signed.url/mock";
  mockGetSignedUrl.mockResolvedValue(signedUrl);
  process.env.AWS_BUCKET_NAME = MOCK_AUDIO_BUCKET_NAME;
  process.env.TRANSCRIPTION_TEMP_BUCKET_NAME =
    MOCK_TRANSCRIPTION_TEMP_BUCKET_NAME;
  process.env.TRANSCRIPTIONS_BUCKET_NAME = MOCK_TRANSCRIPTIONS_BUCKET_NAME;
});
afterEach(() => {
  jest.clearAllMocks();
});

describe("createSignedUrl", () => {
  const mockGetSignedUrl = getSignedUrl as jest.Mock;

  beforeEach(() => {
    mockGetSignedUrl.mockResolvedValue("mocked-url");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("calls getSignedUrl with GetObjectCommand for GET", async () => {
    await createSignedUrl("GET", "mock-bucket", "mock-key");

    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: "mock-bucket",
      Key: "mock-key",
    });

    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(), // s3 client
      expect.any(GetObjectCommand),
      { expiresIn: 3600 }
    );
  });

  test("calls getSignedUrl with PutObjectCommand for PUT", async () => {
    await createSignedUrl("PUT", "mock-bucket", "mock-key");

    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: "mock-bucket",
      Key: "mock-key",
    });

    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(PutObjectCommand),
      { expiresIn: 3600 }
    );
  });

  test("throws error when bucket is undefined", async () => {
    await expect(
      createSignedUrl("GET", undefined as any, "key")
    ).rejects.toThrow("Bucket name is undefined");
  });

  test("throws error when key is undefined", async () => {
    await expect(
      createSignedUrl("GET", "bucket", undefined as any)
    ).rejects.toThrow("Key is undefined");
  });
});

describe("S3 DAO", () => {
  const transcriptionId = "test-uuid";
  const signedUrl = "https://signed.url/mock";

  test("getRawAudioUrl calls GetObjectCommand with correct key", async () => {
    const url = await getRawAudioUrl(transcriptionId);
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_AUDIO_BUCKET_NAME,
      Key: expect.stringContaining(transcriptionId),
    });
    expect(url).toBe(signedUrl);
  });

  test("putRawAudioUrl calls PutObjectCommand with correct key", async () => {
    const url = await putRawAudioUrl(transcriptionId);
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_AUDIO_BUCKET_NAME,
      Key: expect.stringContaining(transcriptionId),
    });
    expect(url).toBe(signedUrl);
  });

  test("putOptimizedAudioUrl calls PutObjectCommand on temp bucket", async () => {
    const url = await putOptimizedAudioUrl(transcriptionId);
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTION_TEMP_BUCKET_NAME,
      Key: expect.stringContaining(transcriptionId),
      ContentType: "audio/ogg",
    });
    expect(url).toBe(signedUrl);
  });

  test("getOptimizedAudioUrl calls GetObjectCommand on temp bucket", async () => {
    const url = await getOptimizedAudioUrl(transcriptionId);
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTION_TEMP_BUCKET_NAME,
      Key: expect.stringContaining(transcriptionId),
      ResponseContentType: "audio/ogg",
    });
    expect(url).toBe(signedUrl);
  });

  test("putOptimizedAudioChunkUrl calls PutObjectCommand on temp bucket", async () => {
    const url = await putOptimizedAudioChunkUrl(transcriptionId, "chunkId");
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTION_TEMP_BUCKET_NAME,
      Key: expect.stringContaining(`${transcriptionId}/chunkId.ogg`),
      ContentType: "audio/ogg",
    });
    expect(url).toBe(signedUrl);
  });

  test("getOptimizedAudioChunkUrl calls GetObjectCommand on temp bucket", async () => {
    const url = await getOptimizedAudioChunkUrl(transcriptionId, "chunkId");
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTION_TEMP_BUCKET_NAME,
      Key: expect.stringContaining(`${transcriptionId}/chunkId.ogg`),
      ResponseContentType: "audio/ogg",
    });
    expect(url).toBe(signedUrl);
  });

  test("putRawTranscriptionUrl calls PutObjectCommand on temp bucket", async () => {
    const url = await putRawTranscriptionUrl(transcriptionId);
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTIONS_BUCKET_NAME,
      Key: expect.stringContaining(transcriptionId),
    });
    expect(url).toBe(signedUrl);
  });

  test("getRawTranscriptionUrl calls GetObjectCommand on temp bucket", async () => {
    const url = await getRawTranscriptionUrl(transcriptionId);
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTIONS_BUCKET_NAME,
      Key: expect.stringContaining(transcriptionId),
    });
    expect(url).toBe(signedUrl);
  });

  test("putFinalTranscriptionUrl calls PutObjectCommand on transcriptions bucket", async () => {
    const url = await putFinalTranscriptionUrl(transcriptionId);
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTIONS_BUCKET_NAME,
      Key: expect.stringContaining(transcriptionId),
    });
    expect(url).toBe(signedUrl);
  });

  test("getFinalTranscriptionUrl calls GetObjectCommand on transcriptions bucket", async () => {
    const url = await getFinalTranscriptionUrl(transcriptionId);
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTIONS_BUCKET_NAME,
      Key: expect.stringContaining(transcriptionId),
    });
    expect(url).toBe(signedUrl);
  });

  test("putRawTranscriptionChunkUrl calls PutObjectCommand on temp bucket", async () => {
    const url = await putRawTranscriptionChunkUrl(transcriptionId, "chunkId");
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTIONS_BUCKET_NAME,
      Key: expect.stringContaining(`${transcriptionId}/chunkId`),
    });
    expect(url).toBe(signedUrl);
  });

  test("getRawTranscriptionChunkUrl calls GetObjectCommand on temp bucket", async () => {
    const url = await getRawTranscriptionChunkUrl(transcriptionId, "chunkId");
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: MOCK_TRANSCRIPTIONS_BUCKET_NAME,
      Key: expect.stringContaining(`${transcriptionId}/chunkId`),
    });
    expect(url).toBe(signedUrl);
  });
});
