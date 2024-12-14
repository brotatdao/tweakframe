# 🖼️ TweakFrame - Farcaster Frame for ENS Subdomains

Create gasless ENS subdomains for your Farcaster profile, automatically generating an IPFS-hosted profile page that resolves to `farcastname.tweakin.eth`.

## ✨ Features

- 🔗 Claim Farcaster username as ENS subdomain
- 🆓 Completely free and gasless
- 🖼️ Auto-generates IPFS profile page
- 🔄 Syncs Farcaster profile picture and bio
- 🌐 Automatic ENS resolution setup

## 🔑 Prerequisites

You'll need API keys from:

- [Namestone](https://namestone.xyz/try-namestone)
- [Neynar](https://neynar.com/)
- [Pinata](https://www.pinata.cloud/) (Premium plan required for .html uploads)
- Firebase Service Account
- Custom local API key

## 🛠️ Setup

### 1. Environment Configuration

Create a `.env` file with your API keys and configuration:

```env
NAMESTONE_API_KEY=your_key_here
NEYNAR_API_KEY=your_key_here
PINATA_API_KEY=your_key_here
PINATA_SECRET_KEY=your_secret_here
LOCAL_API_KEY=your_chosen_key
```

### 2. Firebase Setup

1. Go to Firebase Console → Project Settings → Service Accounts
2. Create new service account
3. Download JSON credentials
4. Save as `brotatdao-firebase.json` in root directory
   - To use a different filename, update reference in `databaseUpload.ts`

### 3. Project Configuration

1. Update `NEXT_PUBLIC_URL` in `/app/config.ts`
   - Set to production URL or ngrok tunnel
2. Modify project name in Pinata upload function:
   ```typescript
   pinata.pinFileToIPFS(Readable.from(htmlBuffer), {
     pinataMetadata: { name: `PROJECTNAME/${profileName}/index.html` }
   })
   ```
3. Update ENS domain in `route.tsx` registerSubdomain API call:
   ```typescript
   domain: 'tweakin.eth'
   ```

### 4. Installation

```bash
pnpm install
```

## 🧪 Testing

### Option 1: Development Server
Good for UI testing, subdomain API gateway may not work.

```bash
pnpm run dev
```
- Access Frog's frame tester at `http://localhost:3000/api/dev`
- Set `devtools: true` in `route.tsx`


### Option 2: Production Build
Full functionality including subdomain API gateway.

```bash
pnpm build
pnpm start
```

### Frame Validation
1. Visit [Warpcast Frame Validator](https://warpcast.com/~/developers/frames)
2. Enter the ngrok URL from your terminal

## 🔍 Frame Testing Tips

- Use ngrok tunnel for local development testing with the warpcast frame validator
- Enable devtools in development mode
- Verify frame responses using Warpcast validator
- Check IPFS uploads through Pinata dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
