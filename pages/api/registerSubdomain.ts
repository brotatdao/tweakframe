import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
    message: string;
    // Add other properties as needed based on the API's error response structure
  }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // Immediately return for non-POST requests
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // API Key Validation
  const apiKey = req.headers.authorization?.split(' ')[1]; 
  if (apiKey !== process.env.LOCAL_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { domain, name, address, single_claim, contenthash, text_records } = req.body;


  // Validate the required fields
  if (!domain || !name || !address) {
    return res.status(400).json({ error: 'Missing required fields: domain, name, or address' });
  }

  const NAMESTONE_API_URL = process.env.NAMESTONE_API_URL || 'https://namestone.xyz/api/public_v1';
  const NAMESTONE_API_KEY = process.env.NAMESTONE_API_KEY;


  try {
    const response = await axios.post(`${NAMESTONE_API_URL}/claim-name`, {
      domain,
      name,
      address,
      single_claim,
      contenthash,
      text_records,
    }, {
      headers: { 'Authorization': NAMESTONE_API_KEY },
    });

    // Check if the Namestone API response is not what's expected
    if (response.status !==  200) {
      console.error('Unexpected response from Namestone API:', response.status, response.data);
      return res.status(500).json({ error: 'Unexpected response from the Namestone API' });
    }

    // Respond with the success data from Namestone API
    return res.status(200).json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Subdomain Registration Failed:', axiosError.message);

    // Log the full error response for debugging purposes
    if (axiosError.response) {
      console.error('Namestone API error response:', axiosError.response.data);
      // Respond with the error data from Namestone API
      return res.status(axiosError.response.status).json(axiosError.response.data);
    } else {
      // Something happened in setting up the request
      return res.status(500).json({ error: axiosError.message });
    }
  }
}
