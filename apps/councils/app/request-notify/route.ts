import { APIClient, SendEmailRequest } from 'customerio-node';

const CUSTOMERIO_API_KEY = process.env.CUSTOMERIO_API_KEY;
if (!CUSTOMERIO_API_KEY) throw new Error('CUSTOMERIO_API_KEY is not set');

export const POST = async (req: Request) => {
  // const { identifier } = req.body;
  const body = await req.json();
  console.log({ body });

  const client = new APIClient(CUSTOMERIO_API_KEY);

  const request = new SendEmailRequest({
    transactional_message_id: '2',
    identifiers: {
      id: 'xyz',
    },
    to: 'scott@hatsprotocol.xyz',
    from: 'scott@hatsprotocol.xyz',
    subject: 'Test subject',
    body: 'Test body',
  });

  client
    .sendEmail(request)
    .then((res) => console.log(res))
    .catch((err) => console.log(err.statusCode, err.message));
  console.log('done');

  return Response.json({ message: 'Hello, world!' }, { status: 200 });
};
