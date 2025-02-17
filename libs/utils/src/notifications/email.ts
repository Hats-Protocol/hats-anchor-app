// import { APIClient, SendEmailRequest } from 'customerio-node';
// import { pick } from 'lodash';

// const CUSTOMERIO_API_KEY = process.env.CUSTOMERIO_API_KEY;
// if (!CUSTOMERIO_API_KEY) throw new Error('CUSTOMERIO_API_KEY is not set');

// interface EmailRequest {
//   email: string;
//   name: string;
//   address: string;
//   messageId: string; // theoretically can be a number also, but preferring string names
//   from: string;
// }

// export const sendEmailRequest = async (email: EmailRequest) => {
//   console.log(email);
//   const { email: to, name, address, messageId, from } = pick(email, ['email', 'name', 'address', 'messageId', 'from']);

//   const client = new APIClient(CUSTOMERIO_API_KEY);

//   const request = new SendEmailRequest({
//     transactional_message_id: messageId,
//     identifiers: { email: to, id: address },
//     message_data: { name, address },
//     to,
//     from: from || 'support@hatsprotocol.xyz',
//   });

//   return client
//     .sendEmail(request)
//     .then((res: any) => {
//       console.log(res);
//       return res;
//     })
//     .catch((err: any) => {
//       console.log(err.statusCode, err.message);
//       return err;
//     });
// };

export const customerioUrl = (id: number) =>
  `https://fly.customer.io/workspaces/175296/journeys/transactional/${id}/overview`;
