import { APIClient, SendEmailRequest } from 'customerio-node';
import { pick } from 'lodash';

const CUSTOMERIO_API_KEY = process.env.CUSTOMERIO_API_KEY;
if (!CUSTOMERIO_API_KEY) throw new Error('CUSTOMERIO_API_KEY is not set');

export const POST = async (req: Request) => {
  // const { identifier } = req.body;
  const body = await req.json();
  const { email, name, address, messageId, from } = pick(body, ['email', 'name', 'address', 'messageId', 'from']);
  console.log(body);
  // TODO check headers for frontend config
  // TODO submit these to a queue instead of sending immediately, check historical sends vs queue
  // TODO check if email is hatsprotocol.xyz (or is a user)

  const client = new APIClient(CUSTOMERIO_API_KEY);

  const request = new SendEmailRequest({
    transactional_message_id: messageId, // overridden by message content? (subject, body)
    identifiers: {
      email: email,
      id: address,
    },
    message_data: {
      name,
      address,
    },
    to: email || 'scott@hatsprotocol.xyz',
    from: from || 'support@hatsprotocol.xyz',
    // subject: 'Test subject', // overrides transactional_message_id
    // body: 'Test body', // overrides transactional_message_id
  });

  client
    .sendEmail(request)
    .then((res) => console.log(res))
    .catch((err) => {
      console.log(err.statusCode, err.message);
      return Response.json({ message: 'Error', success: false }, { status: 500 });
    });

  return Response.json({ message: 'Email sent', success: true }, { status: 200 });
};
