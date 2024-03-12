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
    image: `${process.env.NEXT_PUBLIC_SITE_URL}/alltweaks.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button value="start">Claim a subdomain and make it official.</Button>
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
        image: `${process.env.NEXT_PUBLIC_SITE_URL}/display/a?text=${encodeURIComponent(`welcome ${username}.tweakin.eth`)}&profileImage=${encodeURIComponent(profileImage!)}`,
        imageAspectRatio: '1:1',
        intents: [<Button>Start Over Tweak</Button>],
      })
    } else if (error === 'Name already claimed') {
      return c.res({
        action: '/',
        image: `${process.env.NEXT_PUBLIC_SITE_URL}/display/a?text=${encodeURIComponent(`${username} is already a tweak`)}&profileImage=${encodeURIComponent(profileImage!)}`,
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
  return c.res({
    action: '/',
    image: (
      <div style={{ color: 'black', display: 'flex', fontSize: 60 }}>
        Invalid User
      </div>
    ),
    intents: [<Button>Try Again Tweak</Button>],
  })
})

export const GET = handle(app)
export const POST = handle(app)
