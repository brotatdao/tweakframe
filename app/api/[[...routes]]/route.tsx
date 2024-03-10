/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { getUserDataForFid, getAddressForFid } from "frames.js"


const app = new Frog({
  basePath: '/api',
  hub: neynar({ apiKey: process.env.NEYNAR_API_KEY || 'NEYNAR_FROG_FM' })
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/', (c) => {
  return c.res({
    action: '/claim',
    image: `${process.env.NEXT_PUBLIC_SITE_URL}/site-preview.jpg`,
    intents: [
      <Button value="start">Get Started</Button>
    ],
  })
})

app.frame('/claim', async (c) => {
  const { verified } = c
  if (verified) {
    const { fid } = c.frameData!
    const address = await getAddressForFid({
      fid,
      options: { fallbackToCustodyAddress: true }
    })

    // Fetch user data using the FID
    const userData = await getUserDataForFid({ fid })
    const { profileImage, displayName, username, bio } = userData || {}

    // --- 1. Profile Upload ---
    const profileUploadResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ipfsUpload`, {
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
    const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/registerSubdomain`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOCAL_API_KEY}`  
      },
      body: JSON.stringify({
        domain: 'brotatdao.eth',
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
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/databaseUpload`, {
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
        image: `${process.env.NEXT_PUBLIC_SITE_URL}/meme/a?text=${encodeURIComponent(`${username} claimed`)}&profileImage=${encodeURIComponent(profileImage!)}`,
        intents: [<Button>Start Over 🔄</Button>],
      })
    } else if (error === 'Name already claimed') {
      return c.res({
        action: '/',
        image: `${process.env.NEXT_PUBLIC_SITE_URL}/meme/a?text=${encodeURIComponent(`${username} already claimed`)}&profileImage=${encodeURIComponent(profileImage!)}`,
        intents: [<Button>Start Over 🔄</Button>],
      })
    } else {
      return c.res({
        action: '/',
        image: (
          <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
            Error: {error}
          </div>
        ),
        intents: [<Button>Try Again</Button>],
      })
    }
  }
  return c.res({
    action: '/',
    image: (
      <div style={{ color: 'white', display: 'flex', fontSize: 60 }}>
        Invalid User
      </div>
    ),
    intents: [<Button>Start Over 🔄</Button>],
  })
})

export const GET = handle(app)
export const POST = handle(app)
