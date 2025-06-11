import Nodemailer from 'nodemailer';

export const nodeMailerTransport = Nodemailer.createTransport({
  jsonTransport: true,
});
