import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
  // Add other properties as needed based on the API's error response structure
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    // Immediately return for non-GET requests
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // API Key Validation
  const apiKey = req.headers.authorization?.split(' ')[1];
  if (apiKey !== process.env.LOCAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const walletAddress = req.query.walletAddress;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Missing required query parameter: walletAddress' });
  }

  const OPENSEA_API_URL = 'https://api.opensea.io/api/v2/chain/ethereum/account';
  const OPENSEA_API_KEY = process.env.OPENSEA_KEY; // Ensure you have this environment variable

  try {
    const response = await axios.get(`${OPENSEA_API_URL}/${walletAddress}/nfts?limit=50`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': OPENSEA_API_KEY
      }
    });
  
    if (response.status < 200 || response.status >= 300) { // Check for HTTP error codes
      throw new Error('Network response was not ok: ' + response.statusText);
    }
  
    const nftData = await response.data;

    // Randomly select an NFT
    const randomIndex = Math.floor(Math.random() * nftData.assets.length);
    const selectedNFT = nftData.assets[randomIndex];

    return res.status(200).json(selectedNFT); // Return only the selected NFT 
    } catch (error) {
    const axiosError = error as AxiosError;
    console.error('NFT Fetch Failed:', axiosError.message);

    if (axiosError.response) {
      console.error('OpenSea API error response:', axiosError.response.data);
      return res.status(axiosError.response.status).json(axiosError.response.data);
    } else {
      return res.status(500).json({ error: axiosError.message });
    }
  }
}
