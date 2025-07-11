import { IncomingForm } from 'formidable';
import fs from 'fs';
import ftp from 'basic-ftp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Form parsing error');
    }

    const file = files?.file?.[0];
    if (!file) return res.status(400).send('No file uploaded');

    const client = new ftp.Client();
    client.ftp.verbose = false;

    try {
      await client.access({
        host: 'ftp.jbi.bike',
        user: '3417_ORD',
        password: '80hwE&C2',
        secure: false,
      });

      await client.uploadFrom(file.filepath, file.originalFilename);
      client.close();

      res.status(200).send('Upload successful');
    } catch (e) {
      console.error(e);
      res.status(500).send('FTP upload failed');
    }
  });
}
