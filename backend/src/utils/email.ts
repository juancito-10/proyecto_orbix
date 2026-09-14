import { EmailClient } from "@azure/communication-email";

const connectionString = process.env.AZURE_EMAIL_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("AZURE_EMAIL_CONNECTION_STRING no está configurada");
}

const emailClient = new EmailClient(connectionString);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const message = {
    senderAddress: process.env.AZURE_EMAIL_FROM!,
    content: {
      subject,
      html,
    },
    recipients: {
      to: [
        {
          address: to,
        },
      ],
    },
  };

  const poller = await emailClient.beginSend(message);

  const result = await poller.pollUntilDone();

  return result;
}