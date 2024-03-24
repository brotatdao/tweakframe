/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
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
  hub: neynar({ apiKey: `${process.env.NEYNAR_API_KEY}`}),
  verify: 'silent',
// headers: {
//    'Cache-Control': 'max-age=0',
//  },
//  honoOptions: {
//    getPath: (req) => '/' + req.headers.get('host') + req.url.replace(/^https?:\/\/[^/]+(\/[^?]*)/, '$1'),
//  },
  dev: { enabled: false }
})

//const fdk = new PinataFDK({
//  pinata_jwt: process.env.PINATA_JWT || '',
//  pinata_gateway: process.env.PINATA_IPFS_GATEWAY || ''
//})
 
//app.use('/', fdk.analyticsMiddleware({
//  frameId: 'tweakin',
//  customId: 'firsttweak',
//}))

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
  // Check if the frame data is verified
  if (!c.verified) {
    console.error('Frame verification failed');
    // Optionally handle unverified frames, for example, by informing the user
    return c.res({
      action: '/',
      image: `${process.env.NEXT_PUBLIC_URL}/tweakerror.png`, // Provide an appropriate error image
      imageAspectRatio: '1:1',
      intents: [<Button>Try Again</Button>],
    });
  }
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
    })

    if (!profileUploadResponse.ok) {
      throw new Error('Profile upload to IPFS failed')
    }

    const { profileHtmlUrl, profilePicUrl } = await profileUploadResponse.json()

    // --- 2. ENS Registration ---
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
          "com.twitter": username,
          "description": bio, 
          "avatar": profilePicUrl,
        },
        single_claim: true,
      }),
    })
    const { success, error } = await registerResponse.json()

    // --- 3. Firestore Save ---
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/databaseUpload`, {
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

    if (success) {

      return c.res({
        action: '/',
        image: `${process.env.NEXT_PUBLIC_URL}/display/a?text=${encodeURIComponent(`welcome ${username}.tweakin.eth`)}&profileImage=${encodeURIComponent(profileImage!)}`,
        imageAspectRatio: '1:1',
        intents: [<Button>Start Over Tweak</Button>],
      })
    } else if (error === 'Name already claimed') {
      return c.res({
        action: '/',
        image: `${process.env.NEXT_PUBLIC_URL}/display/a?text=${encodeURIComponent(`${username} is already a tweak`)}&profileImage=${encodeURIComponent(profileImage!)}`,
        imageAspectRatio: '1:1',
        intents: [<Button>Start Over Tweak</Button>],
      })
    } else {
      return c.res({
        action: '/',
        image: (
          <div style={{ color: 'black', display: 'flex', fontSize: 60 }}>
            Error: {error}
          </div>
        ),
        intents: [<Button>Try Again Tweak</Button>],
      })
    }
  }
)

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
