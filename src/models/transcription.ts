/**
 * The transcription ID, a UUIDv4 string.
 * @example "123e4567-e89b-12d3-a456-426614174000"
 */
export type TranscriptionId = string;

export enum TranscriptionStatus {
  /**
   * The transcription is being processed.
   */
  PROCESSING = "processing",
  /**
   * The transcription is ready.
   */
  READY = "ready",
  /**
   * The transcription has failed.
   */
  ERROR = "error",
}

/**
 * The transcription model as stored in the database.
 * The id is a UUIDv4 string, and is the partition key of the table.
 * The userId is the id of the user that owns the transcription, and
 * is the sort key of the table.
 */
export type DDBTranscription = {
  /**
   * The transcriptino ID, a UUIDv4 string.
   * @readonly
   */
  id: TranscriptionId;
  /**
   * The title of the transcription
   */
  title: string;
  /**
   * The status of the transcription
   * @enum {TranscriptionStatus}
   */
  status: TranscriptionStatus;
  /**
   * When the transcription was created. An ISO 8601 string.
   * For example, "2023-10-01T12:00:00Z".
   * @readonly
   * @example "2023-10-01T12:00:00Z"
   */
  createdAt: string;
  /**
   * The id of the user that owns the transcription
   * @external https://clerk.dev/docs/reference/clerk-api#users
   */
  userId: string;
  /**
   * The length of the transcription in seconds
   * @readonly
   * @default 0
   */
  transcriptionLength: number;
  /**
   * The audio file extension of the transcription
   * @example "mp3"
   */
  audioExtension: string;
};

export type Transcription = Pick<DDBTranscription, "id" | "createdAt">;
