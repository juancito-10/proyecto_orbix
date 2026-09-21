import { EmailClient } from '@azure/communication-email'

import { env } from '../../config/env'

const client = new EmailClient(env.AZURE_EMAIL_CONNECTION_STRING)

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
) => {
  const message = {
    senderAddress: env.AZURE_EMAIL_FROM,
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
  }

  const poller = await client.beginSend(message)

  await poller.pollUntilDone()
}