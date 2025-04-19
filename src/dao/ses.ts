import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESClient,
} from "@aws-sdk/client-ses";

/**
 * Sends an email using AWS SES
 * @param to The email address to send the email to
 * @param subject The subject of the email
 * @param body The body of the email
 * @requires `process.env.SES_SOURCE_EMAIL`
 * @returns
 */
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  params?: {
    senderEmail?: string;
    senderName?: string;
    replyTo?: string;
  },
) {
  const ses = new SESClient({});

  const input: SendEmailCommandInput = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Text: { Data: body },
      },
      Subject: { Data: subject },
    },
    Source: `${params?.senderName || "Deepscribes Info"} <${
      params?.senderEmail || process.env.SES_SOURCE_EMAIL
    }>`,
  };

  return await ses.send(new SendEmailCommand(input));
}
