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

  // --- ENS Registration first ---
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
      contenthash: '',
      text_records: {
        "com.twitter": username,
        "description": bio, 
        "avatar": '',
      },
      single_claim: true,
    }),
  })
  const { success, error } = await registerResponse.json()

  if (!success) {
    if (error === 'Name already claimed') {
      return c.res({
        action: '/',
        image: `${process.env.NEXT_PUBLIC_URL}/display/a?text=${encodeURIComponent(`${username} is already a tweak`)}&profileImage=${encodeURIComponent(profileImage!)}`,
        imageAspectRatio: '1:1',
        intents: [<Button>Start Over Tweak</Button>],
      })
    } else {
      return c.res({
        action: '/',
        image: `${process.env.NEXT_PUBLIC_URL}/display/b?text=${encodeURIComponent(error)}`,
        intents: [<Button>Try Again Tweak</Button>],
      })
    }
  }

  // If ENS Registration succeeds, proceed with Profile Upload
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
  })

  if (!profileUploadResponse.ok) {
    return c.res({
      action: '/',
      image: `${process.env.NEXT_PUBLIC_URL}/display/b?text=Error:%20IPFS%20upload%20failed`,
      intents: [<Button>Try Again Tweak</Button>],
    })
  }

  const { profileHtmlUrl, profilePicUrl } = await profileUploadResponse.json()

  // Firestore Save
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
  })

  if (!firestoreResponse.ok) {
    return c.res({
      action: '/',
      image: `${process.env.NEXT_PUBLIC_URL}/display/b?text=Error:%20Database%20upload%20failed`,
      intents: [<Button>Try Again Tweak</Button>],
    })
  }

  // If all operations are successful, display the success message
  return c.res({
    action: '/',
    image: `${process.env.NEXT_PUBLIC_URL}/display/a?text=${encodeURIComponent(`welcome ${username}.tweakin.eth`)}&profileImage=${encodeURIComponent(profileImage!)}`,
    imageAspectRatio: '1:1',
    intents: [<Button>Start Over Tweak</Button>],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
