import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const hasText = searchParams.has('text')
  const text = hasText ? searchParams.get('text')?.slice(0, 100) : ''

  const hasProfileImage = searchParams.has('profileImage')
  const profileImage = hasProfileImage ? searchParams.get('profileImage') : `${process.env.NEXT_PUBLIC_SITE_URL}/default.jpg`

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
        {profileImage ? (
          // @ts-ignore
          <img width="1200" height="1200" alt="Profile" src={profileImage} />
        ) : (
          <div
            style={{
              width: '1200px',
              height: '630px',
              background: '#f6f6f6',
            }}
          />
        )}
        <p
          style={{
            position: 'absolute',
            margin: 0,
            paddingBottom: 20,
            color: '#ffffff',
            lineHeight: 1,
            fontSize: 100,
            fontFamily: '"Oswald Bold"',
            textAlign: 'center',
            textTransform: 'uppercase',
            textShadow:
              '5px 5px 3px #000, -5px 5px 3px #000, -5px -5px 0 #000, 5px -5px 0 #000',
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