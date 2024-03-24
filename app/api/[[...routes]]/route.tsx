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
  hub: neynar({ apiKey: process.env.NEYNAR_API_KEY || 'NEYNAR_FROG_FM' }),
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

app.frame('/claim', (c) => {
  return c.res({
    action: '/',
    image: `${process.env.NEXT_PUBLIC_URL}/tweakerror.png`,
    imageAspectRatio: '1:1',
    intents: [
      <Button value="claim">success.</Button>
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
