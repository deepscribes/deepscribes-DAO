import {
  DDBTranscription,
  TranscriptionStatus,
} from "../src/models/transcription";

export const SAMPLE_TRANSCRIPTION_ID = "1";
export const SAMPLE_USER_ID = "clerk__user_id";
export const SAMPLE_TRANSCRIPTION_TITLE = "Test Transcription";
export const SAMPLE_ANOTHER_TRANSCRIPTION_TITLE = "Another Test Transcription";
export const SAMPLE_TRANSCRIPTION_CREATED_AT_DATE = new Date(
  "2023-10-01T12:00:00Z",
).toISOString();

export const SAMPLE_TRANSCRIPTION: DDBTranscription = {
  id: SAMPLE_TRANSCRIPTION_ID,
  createdAt: SAMPLE_TRANSCRIPTION_CREATED_AT_DATE,
  status: TranscriptionStatus.READY,
  title: SAMPLE_TRANSCRIPTION_TITLE,
  userId: SAMPLE_USER_ID,
};

export const SAMPLE_TRANSCRIPTION_ITEM = {
  id: { S: SAMPLE_TRANSCRIPTION_ID },
  title: { S: SAMPLE_TRANSCRIPTION_TITLE },
  status: { S: SAMPLE_TRANSCRIPTION.status },
  userId: { S: SAMPLE_USER_ID },
  createdAt: { S: SAMPLE_TRANSCRIPTION_CREATED_AT_DATE },
};
