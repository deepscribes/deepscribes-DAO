import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "../src/models/subscription";
import {
  DDBTranscription,
  TranscriptionStatus,
} from "../src/models/transcription";

// ======== Clerk ========
export const TEST_TEST_USER_ID = "user_2qo3wTIwIr5tvx3zJYxb3BiG5SU";
export const PROD_TEST_USER_ID = "user_2vwaop97p3Yvciz4jVaBZdwGHKk";

// ======== S3 ========
export const MOCK_AUDIO_BUCKET_NAME = "mock-audio-bucket";
export const MOCK_TRANSCRIPTIONS_BUCKET_NAME = "mock-transcriptions-bucket";
export const MOCK_TRANSCRIPTION_TEMP_BUCKET_NAME = "mock-temp-bucket";

// ======= DDB ========
export const SAMPLE_USER_ID = "clerk__user_id";

// Transcription
export const SAMPLE_TRANSCRIPTION_TABLE_NAME = "transcriptions";
export const SAMPLE_TRANSCRIPTION_ID = "1";
export const SAMPLE_TRANSCRIPTION_TITLE = "Test Transcription";
export const SAMPLE_ANOTHER_TRANSCRIPTION_TITLE = "Another Test Transcription";
export const SAMPLE_TRANSCRIPTION_CREATED_AT_DATE = new Date(
  "2023-10-01T12:00:00Z"
).toISOString();
export const SAMPLE_TRANSCRIPTION_LENGTH = 92.45;

export const SAMPLE_TRANSCRIPTION: DDBTranscription = {
  id: SAMPLE_TRANSCRIPTION_ID,
  createdAt: SAMPLE_TRANSCRIPTION_CREATED_AT_DATE,
  status: TranscriptionStatus.READY,
  title: SAMPLE_TRANSCRIPTION_TITLE,
  userId: SAMPLE_USER_ID,
  transcriptionLength: SAMPLE_TRANSCRIPTION_LENGTH,
};

export const SAMPLE_TRANSCRIPTION_ITEM = {
  id: { S: SAMPLE_TRANSCRIPTION_ID },
  title: { S: SAMPLE_TRANSCRIPTION_TITLE },
  status: { S: SAMPLE_TRANSCRIPTION.status },
  userId: { S: SAMPLE_USER_ID },
  createdAt: { S: SAMPLE_TRANSCRIPTION_CREATED_AT_DATE },
  transcriptionLength: { N: SAMPLE_TRANSCRIPTION_LENGTH.toString() },
};

export const SAMPLE_TRANSCRIPTION_IDEMPOTENCY_ID = "idempotency_id_123";
export const SAMPLE_ANOTHER_TRANSCRIPTION_IDEMPOTENCY_ID = "idempotency_id_456";

// Subscription
export const SAMPLE_SUBSCRIPTION_TABLE_NAME = "subscriptions";
export const SAMPLE_SUBSCRIPTION_ID = "sub-123";
export const SAMPLE_SUBSCRIPTION: Subscription = {
  id: SAMPLE_SUBSCRIPTION_ID,
  userId: SAMPLE_USER_ID,
  plan: "basic" as SubscriptionPlan,
  status: "active" as SubscriptionStatus,
  expirationDate: "2025-12-31T23:59:59Z",
  createdAt: "2025-07-06T12:00:00Z",
  updatedAt: "2025-07-06T12:00:00Z",
  isTrial: false,
};
export const SAMPLE_SUBSCRIPTION_FT: Subscription = {
  ...SAMPLE_SUBSCRIPTION,
  isTrial: true,
};
export const SAMPLE_SUBSCRIPTION_ITEM = {
  id: { S: SAMPLE_SUBSCRIPTION_ID },
  userId: { S: SAMPLE_USER_ID },
  plan: { S: "basic" },
  expirationDate: { S: "2025-12-31T23:59:59Z" },
  createdAt: { S: "2025-07-06T12:00:00Z" },
  updatedAt: { S: "2025-07-06T12:00:00Z" },
  isTrial: { BOOL: false },
  status: { S: "active" },
};
