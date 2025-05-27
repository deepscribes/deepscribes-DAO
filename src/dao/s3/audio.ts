import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TranscriptionId } from "../../models/transcription";
import {
  AUDIO_PREFIX,
  OPTIMIZED_AUDIO_PREFIX,
  RAW_TRANSCRIPTION_PREFIX,
  FINAL_TRANSCRIPTION_PREFIX,
} from "../../utils/config";

import { s3 } from "../../utils/s3";

const AUDIO_BUCKET = process.env.AWS_BUCKET_NAME!;
const TEMP_BUCKET = process.env.TRANSCRIPTION_TEMP_BUCKET_NAME!;
const TRANSCRIPTIONS_BUKET = process.env.TRANSCRIPTIONS_BUCKET_NAME!;
const SIGNED_URL_EXPIRATION = 60 * 60; // 1 hour

/**
 * Helper to create a signed URL for either GET or PUT
 */
export async function createSignedUrl(
  method: "GET" | "PUT",
  bucket: string,
  key: string,
  contentType?: string
): Promise<string> {
  if (bucket === undefined) {
    throw new Error("Bucket name is undefined");
  }
  if (key === undefined) {
    throw new Error("Key is undefined");
  }
  const command =
    method === "GET"
      ? new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          ResponseContentType: contentType,
        })
      : new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: contentType,
        });

  return getSignedUrl(s3, command, { expiresIn: SIGNED_URL_EXPIRATION });
}

// --------- AUDIO FILES ---------

export function getRawAudioUrl(
  transcriptionId: TranscriptionId,
  audioExtension: string
) {
  const key = `${AUDIO_PREFIX}${transcriptionId}.${audioExtension}`;
  return createSignedUrl("GET", AUDIO_BUCKET, key);
}

export function putRawAudioUrl(
  transcriptionId: TranscriptionId,
  audioExtension: string
) {
  const key = `${AUDIO_PREFIX}${transcriptionId}.${audioExtension}`;
  return createSignedUrl("PUT", AUDIO_BUCKET, key);
}

export function putOptimizedAudioUrl(transcriptionId: TranscriptionId) {
  const key = `${OPTIMIZED_AUDIO_PREFIX}${transcriptionId}.ogg`;
  return createSignedUrl("PUT", TEMP_BUCKET, key, "audio/ogg");
}

export function getOptimizedAudioUrl(transcriptionId: TranscriptionId) {
  const key = `${OPTIMIZED_AUDIO_PREFIX}${transcriptionId}.ogg`;
  return createSignedUrl("GET", TEMP_BUCKET, key, "audio/ogg");
}

export function getOptimizedAudioChunkUrl(
  transcriptionId: TranscriptionId,
  chunkId: string
) {
  const key = `${OPTIMIZED_AUDIO_PREFIX}${transcriptionId}/${chunkId}.ogg`;
  return createSignedUrl("GET", TEMP_BUCKET, key, "audio/ogg");
}

export function putOptimizedAudioChunkUrl(
  transcriptionId: TranscriptionId,
  chunkId: string
) {
  const key = `${OPTIMIZED_AUDIO_PREFIX}${transcriptionId}/${chunkId}.ogg`;
  return createSignedUrl("PUT", TEMP_BUCKET, key, "audio/ogg");
}

// --------- RAW TRANSCRIPTION (e.g. from Deepgram/Groq) ---------

export function putRawTranscriptionUrl(transcriptionId: TranscriptionId) {
  const key = `${RAW_TRANSCRIPTION_PREFIX}${transcriptionId}`;
  return createSignedUrl("PUT", TRANSCRIPTIONS_BUKET, key);
}

export function getRawTranscriptionUrl(transcriptionId: TranscriptionId) {
  const key = `${RAW_TRANSCRIPTION_PREFIX}${transcriptionId}`;
  return createSignedUrl("GET", TRANSCRIPTIONS_BUKET, key);
}

export function putRawTranscriptionChunkUrl(
  transcriptionId: TranscriptionId,
  chunkId: string
) {
  const key = `${RAW_TRANSCRIPTION_PREFIX}${transcriptionId}/${chunkId}`;
  return createSignedUrl("PUT", TRANSCRIPTIONS_BUKET, key);
}

export function getRawTranscriptionChunkUrl(
  transcriptionId: TranscriptionId,
  chunkId: string
) {
  const key = `${RAW_TRANSCRIPTION_PREFIX}${transcriptionId}/${chunkId}`;
  return createSignedUrl("GET", TRANSCRIPTIONS_BUKET, key);
}

// --------- FINAL TRANSCRIPTION ---------

export function putFinalTranscriptionUrl(transcriptionId: TranscriptionId) {
  const key = `${FINAL_TRANSCRIPTION_PREFIX}${transcriptionId}`;
  return createSignedUrl("PUT", TRANSCRIPTIONS_BUKET, key);
}

export function getFinalTranscriptionUrl(transcriptionId: TranscriptionId) {
  const key = `${FINAL_TRANSCRIPTION_PREFIX}${transcriptionId}`;
  return createSignedUrl("GET", TRANSCRIPTIONS_BUKET, key);
}
