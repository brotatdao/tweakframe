//boilerplate image generation - with static image

import { ImageResponse } from 'next/og'
// App router includes @vercel/og.
// No need to install it.

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const hasText = searchParams.has('text')
  const text = hasText ? searchParams.get('text')?.slice(0, 100) : ''

  const imageData = await fetch(
    new URL('./errortweak.png', import.meta.url)
  ).then((res) => res.arrayBuffer())

  const fontData = await fetch(
    new URL('../../../assets/Tweakmodern-Regular.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          background: '#f6f6f6',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* @ts-ignore */}
        <img width="630" height="630" alt="meme" src={imageData} />
        <p
          style={{
            position: 'absolute',
            margin: 0,
            paddingBottom: 20,
            color: '#ffffff',
            lineHeight: 1,
            fontSize: 100,
            fontFamily: '"Tweakmodern Regular"',
            textAlign: 'center',
            textTransform: 'uppercase',
            textShadow: '0 0 5px #000, 0 0 5px #000, 0 0 5px #000, 0 0 5px #000',
          }}
        >
          {text}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
      fonts: [
        {
          name: 'Tweakmodern Regular',
          data: fontData,
          style: 'normal',
        },
      ],
    }
  )
}
