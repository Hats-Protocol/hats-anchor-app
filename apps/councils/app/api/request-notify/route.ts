import { APIClient, SendEmailRequest } from 'customerio-node';
import { pick } from 'lodash';

const CUSTOMERIO_API_KEY = process.env.CUSTOMERIO_API_KEY;
if (!CUSTOMERIO_API_KEY) throw new Error('CUSTOMERIO_API_KEY is not set');

export const POST = async (req: Request) => {
  // const { identifier } = req.body;
  const body = await req.json();
  const { email, name, address } = pick(body, ['email', 'name', 'address']);
  console.log(body);
  // TODO check headers for frontend config
  // TODO submit these to a queue instead of sending immediately, check historical sends vs queue

  const client = new APIClient(CUSTOMERIO_API_KEY);

  const request = new SendEmailRequest({
    // TODO pass message id
    transactional_message_id: '2', // overridden by message content? (subject, body)
    identifiers: {
      email: email,
      id: address,
    },
    message_data: {
      name,
      address,
    },
    to: email || 'scott@hatsprotocol.xyz',
    // from: 'scott@hatsprotocol.xyz', // ignored?
    // subject: 'Test subject', // overrides transactional_message_id
    // body: 'Test body', // overrides transactional_message_id
  });

  client
    .sendEmail(request)
    .then((res) => console.log(res))
    .catch((err) => console.log(err.statusCode, err.message));
  console.log('done');

  return Response.json({ message: 'Hello, world!' }, { status: 200 });
};
