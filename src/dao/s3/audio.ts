import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AudioARN } from "../../models/audio";
import { TranscriptionId } from "../../models/transcription";
import { AUDIO_PREFIX } from "../../utils/config";

export function getAudioFileArn(transcriptionId: TranscriptionId): AudioARN {
  return `arn:aws:s3:::${process.env.AWS_BUCKET_NAME}/${AUDIO_PREFIX}${transcriptionId}`;
}

export function getAudioUrl(audioArn: AudioARN) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const bucketName = process.env.AWS_BUCKET_NAME;
  const key = audioArn.split(":").pop()?.replace(`${bucketName}/`, "");

  const params = {
    Bucket: bucketName!,
    Key: key,
  };

  return getSignedUrl(s3, new GetObjectCommand(params), { expiresIn: 60 * 60 });
}

export function getAudioPutUrl(fileName: string) {
  const bucketName = process.env.AWS_BUCKET_NAME;

  const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const params = {
    Bucket: bucketName!,
    Key: fileName,
  };

  return getSignedUrl(s3, new PutObjectCommand(params), { expiresIn: 60 * 60 });
}
