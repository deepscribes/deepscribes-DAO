export type AudioARN = `arn:aws:s3:::${string}/audio/${string}`;
export type AudioUrl = `https://${string}.s3.amazonaws.com/audio/${string}`;
export type PresignedAudioUrl =
  `https://${string}.s3.amazonaws.com/audio/${string}`;
