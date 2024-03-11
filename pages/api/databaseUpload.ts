import { db } from '../../utils/firebaseAdmin';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

interface ProfileData {
  profileName: string;
  profileNameLower: string;
  bio: string;
  walletAddress: string;
  twitterHandle: string;
  profileHtmlUrl: string;
  profilePicUrl: string;
  ipfsUrl: string;
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  metadata_url: string;
  is_disabled: boolean;
  is_nsfw: boolean;
  opensea_url: string;
  created_at: string;
  updated_at: string;
  firebaseUserId: string;
 }
 

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

  const collection = req.query.collection || 'Profiles'; // Default to 'Profiles' if unspecified

  try {
    const {  
      profileName, bio, walletAddress, twitterHandle, profileHtmlUrl, 
      profilePicUrl, 
      identifier: providedIdentifier, 
      collection: providedCollection, 
      contract: providedContract, 
      token_standard: providedTokenStandard, 
      name: providedName, 
      description: providedDescription, 
      image_url: providedImageUrl, 
      metadata_url: providedMetadataUrl, 
      is_disabled: providedIsDisabled, 
      is_nsfw: providedIsNsfw, 
      opensea_url: providedOpenseaUrl
    } = req.body;

    // **Check for required fields**
    if (!profileName || !bio || !walletAddress || !twitterHandle || !profileHtmlUrl || !profilePicUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // **Assign default values for optional fields**
    let identifier = providedIdentifier || '';
    let collection = providedCollection || '';
    let contract = providedContract || '';
    let token_standard = providedTokenStandard || '';
    let name = providedName || '';
    let description = providedDescription || '';
    let image_url = providedImageUrl || '';
    let metadata_url = providedMetadataUrl || '';
    let is_disabled = providedIsDisabled || false; 
    let is_nsfw = providedIsNsfw || false; 
    let opensea_url = providedOpenseaUrl || '';

    
    // Generate a Firebase ID 
    const firebaseUserId = db.collection('Profiles').doc().id; 

    const profileData = {
      profileName,
      profileNameLower: profileName.toLowerCase(),
      bio,
      walletAddress,
      twitterHandle,
      profileHtmlUrl,
      profilePicUrl,
      ipfsUrl: profileHtmlUrl, 
      identifier,
      collection,
      contract,
      token_standard,
      name,
      description,
      image_url,
      metadata_url,
      is_disabled,
      is_nsfw,
      opensea_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      firebaseUserId
    };

    const profileDocRef = db.collection("Profiles").doc(firebaseUserId); 

    // Logging for enhanced inspection (Feel free to remove in production)
    console.log('db:', db); 
    console.log('Firestore methods:', Object.keys(db)); 
    console.log('profileData:', profileData);

    await profileDocRef.set(profileData); 

    res.status(200).json({ message: 'Profile saved to Firestore' });
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}