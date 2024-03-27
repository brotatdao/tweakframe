/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { getUserDataForFid, getAddressForFid } from "frames.js"
import { PinataFDK } from 'pinata-fdk'
import { serveStatic } from 'frog/serve-static'


const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
//  browserLocation: '/',
//  secret: process.env.FROG_SECRET_KEY,
  origin: `${process.env.NEXT_PUBLIC_URL}`,
  hub: neynar({ apiKey: process.env.NEYNAR_API_KEY || 'NEYNAR_FROG_FM' }),
  verify: 'silent',
  dev: { enabled: false }
})

const fdk = new PinataFDK({
  pinata_jwt: `${process.env.PINATA_JWT}`,
  pinata_gateway: `${process.env.PINATA_IPFS_GATEWAY}`,
})
 
app.use('/', fdk.analyticsMiddleware({
  frameId: 'tweakin',
  customId: 'firsttweak',
}))

app.frame('/', (c) => {
  return c.res({
    action: '/claim',
    image: `${process.env.NEXT_PUBLIC_URL}/alltweaks.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button value="claim">Claim a subdomain and make it official.</Button>
    ],
  })
})

app.frame('/claim', async (c) => {
  const { fid } = c.frameData!
  const address = await getAddressForFid({
    fid,
    options: { fallbackToCustodyAddress: true }
  })

  // Fetch user data using the FID
  const userData = await getUserDataForFid({ fid })
  const { profileImage, displayName, username, bio } = userData || {}

 // --- 1. Profile Upload ---
 const profileUploadResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/ipfsUpload`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.LOCAL_API_KEY}` 
  },
  body: JSON.stringify({
    profileName: username,
    bio,
    profilePicUrl: profileImage,
  }),
});

if (!profileUploadResponse.ok) {
  return c.res({
    action: '/',
    image: `${process.env.NEXT_PUBLIC_URL}/display/b?text=Profile%20upload%20to%20IPFS%20failed`,
    imageAspectRatio: '1:1',
    intents: [<Button>Try Again Tweak</Button>],
  });
}

const { profileHtmlUrl, profilePicUrl } = await profileUploadResponse.json();

// --- 2. ENS Registration  ---
const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/registerSubdomain`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.LOCAL_API_KEY}`  
  },
  body: JSON.stringify({
    domain: 'tweakin.eth',
    name: username,
    address: address || '',
    contenthash: profileHtmlUrl,
    text_records: {
      "description": bio, 
      "avatar": profilePicUrl,
    },
    single_claim: true,
  }),
});

const { success, error } = await registerResponse.json();

if (!success) {
  if (error === 'Name already claimed') {
    return c.res({
      action: '/',
      image: `${process.env.NEXT_PUBLIC_URL}/display/a?text=${encodeURIComponent(`${username} is already a tweak`)}&profileImage=${encodeURIComponent(profileImage!)}`,
      imageAspectRatio: '1:1',
      intents: [<Button.Link href="https://tweaklabs.xyz">Go to tweaklabs.xyz</Button.Link>],
    });
  } else {
    return c.res({
      action: '/',
      image: `${process.env.NEXT_PUBLIC_URL}/display/b?text=${encodeURIComponent(`Error: ${error}`)}`,
      imageAspectRatio: '1:1',
      intents: [
        <Button.Link href={`https://app.ens.domains/${username}.tweakin.eth`}>{`ENS App`}</Button.Link>,
        <Button.Link href={`https://${username}.tweakin.eth.limo`}>{`${username}.tweakin.eth`}</Button.Link>,
        <Button.Link href={`https://explore.tweakframe.xyz`}>{`Tweaks`}</Button.Link>,
      ],
    });
  }
}

// --- 3. Firestore Save ---
const firestoreResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/databaseUpload`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.LOCAL_API_KEY}`
  },
  body: JSON.stringify({
    profileName: username,
    bio,
    walletAddress: address || '', 
    twitterHandle: username,
    profileHtmlUrl,
    profilePicUrl,
    image_url: profileImage,
  }),
});

  if (!firestoreResponse.ok) {
    return c.res({
      action: '/',
      image: `${process.env.NEXT_PUBLIC_URL}/display/b?text=Firestore%20save%20failed`,
      imageAspectRatio: '1:1',
      intents: [<Button>Try Again Tweak</Button>],
    });
  }

  // If all operations are successful, display the success message
  return c.res({
    action: '/',
    image: `${process.env.NEXT_PUBLIC_URL}/display/a?text=${encodeURIComponent(`welcome ${username}.tweakin.eth`)}&profileImage=${encodeURIComponent(profileImage!)}`,
    imageAspectRatio: '1:1',
    intents: [
      <Button.Link href={`https://app.ens.domains/${username}.tweakin.eth`}>{`ENS App`}</Button.Link>,
      <Button.Link href={`https://${username}.tweakin.eth.limo`}>{`${username}.tweakin.eth`}</Button.Link>,
      <Button.Link href={`https://explore.tweakframe.xyz`}>{`Tweaks`}</Button.Link>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
