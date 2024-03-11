//Scale down profile pic image

import { ImageResponse } from 'next/og';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hasText = searchParams.has('text');
  const text = hasText ? searchParams.get('text')?.slice(0, 100) : '';
  const hasProfileImage = searchParams.has('profileImage');
  const profileImage = hasProfileImage ? searchParams.get('profileImage') : '';
  const defaultImageUrl = process.env.NEXT_PUBLIC_SITE_URL + '/default.jpg';

  const fontPath = path.join(process.cwd(), 'assets', 'Tweakmodern-Regular.ttf');
  const fontData = await fs.readFile(fontPath);

  let optimizedImage: ArrayBuffer;

  if (profileImage) {
    // Fetch the profile image
    const imageResponse = await fetch(profileImage);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Resize and compress the image using sharp
    const optimizedBuffer = await sharp(imageBuffer)
      .resize({ width: 1200, height: 1200, fit: 'cover' })
      .jpeg({ quality: 70 }) // Reduce the quality to further compress the image
      .toBuffer();

    optimizedImage = optimizedBuffer.buffer.slice(
      optimizedBuffer.byteOffset,
      optimizedBuffer.byteOffset + optimizedBuffer.byteLength
    );
  } else {
    // Fetch the default image
    const defaultImageResponse = await fetch(defaultImageUrl);
    const defaultImageBuffer = await defaultImageResponse.arrayBuffer();

    // Resize and compress the default image using sharp
    const optimizedBuffer = await sharp(defaultImageBuffer)
      .resize({ width: 1200, height: 1200, fit: 'cover' })
      .jpeg({ quality: 70 }) // Reduce the quality to further compress the image
      .toBuffer();

    optimizedImage = optimizedBuffer.buffer.slice(
      optimizedBuffer.byteOffset,
      optimizedBuffer.byteOffset + optimizedBuffer.byteLength
    );
  }

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
        <img width="1200" height="1200" alt="Profile" src={optimizedImage} /> 
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
            textShadow: '5px 5px 3px #000, -5px 5px 3px #000, -5px -5px 0 #000, 5px -5px 0 #000',
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
  );
}