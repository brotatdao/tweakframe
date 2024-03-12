import PinataClient from '@pinata/sdk';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream'; 
import { generateProfileCardHtml } from '../../utils/generateProfileCard';
import axios from 'axios';

// Initialize Pinata SDK
const pinata = new PinataClient(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

async function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Next.js API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, Cors({ methods: ['POST'] })); 
  
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    // API Key Validation
    const apiKey = req.headers.authorization?.split(' ')[1]; 
    if (apiKey !== process.env.LOCAL_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

  const { profileName, bio, profilePicUrl } = req.body;

  if (!profileName || !bio || !profilePicUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
      // Generate HTML content
      const profileCardHtmlContent = generateProfileCardHtml({ profileName, bio, profilePicUrl }); 
      const htmlBuffer = Buffer.from(profileCardHtmlContent);

      // Fetch profile image using axios
      const fetchImage = async (url: string): Promise<{ buffer: Buffer, contentType: string }> => {
          try {
              const response = await axios.get(url, { responseType: 'arraybuffer' }); 
              return {
                  buffer: Buffer.from(response.data),
                  contentType: response.headers['content-type'] || ''
              };    
          } catch (error) {
              console.error('Image fetch error:', error);
              throw error; 
          }
      }

      const { buffer: profilePicBuffer, contentType } = await fetchImage(profilePicUrl);

      // Upload to Pinata IPFS
      console.log('Attempting Pinata IPFS upload...');
      const uploadResults = await Promise.all([
          pinata.pinFileToIPFS(Readable.from(htmlBuffer), { pinataMetadata: { name: `tweakin/${profileName}/index.html` } }),
          pinata.pinFileToIPFS(Readable.from(profilePicBuffer), { pinataMetadata: { name: `tweakin/${profileName}/profile-pic` } }) 
      ]);

      const htmlFileCid = uploadResults[0].IpfsHash;
      const profilePicCid = uploadResults[1].IpfsHash;

      if (!htmlFileCid || !profilePicCid) {
          throw new Error('IPFS upload failed');
      }

      res.status(200).json({
          message: 'Profile uploaded to IPFS',
          profileHtmlUrl: `ipfs://${htmlFileCid}`,
          profilePicUrl: `ipfs://${profilePicCid}`,
      });

  } catch (error) {
      console.error('Error uploading to IPFS:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}