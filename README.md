# Ens Subdomain Frame

## Namestone API
You need a namestone API key - Get it here:
[https://namestone.xyz/try-namestone](https://namestone.xyz/try-namestone)

Your Admin Panel will be located here:
[https://namestone.xyz/admin](https://namestone.xyz/admin)

## NEYNAR API
You need a neynar API key - Get it here:
[https://neynar.com/](https://neynar.com/)

## PINATA API
You need a pinata api key to publish your files.  You will not be able to use the free plan as it does not allow for .html file uploads.
[https://www.pinata.cloud/](https://www.pinata.cloud/)

## NFT API  - OPENSEA or ZORA - set up for opensea
If you would like to choose an NFT profile picture, you will need an Opensea API key - Get it here:
[https://docs.opensea.io/reference/api-overview](https://docs.opensea.io/reference/api-overview)

## LOCAL API
To protect your API endpoints from outside traffic, please set a local key of your choosing.

## FIREBASE SERVICE ACCOUNT
You need to set up a firebase service account to interact with the firestore database.  Go to your firebase account Project Settings > Service Accounts - and create a new service account.  You will be given a JSON file with your credentials.  I have this file named brotatdao-firebase.json in the root.  If you would like to change the name, ensure it is changed in databaseUpload.ts as well.

## Project Setup
First - Set up .env file 

Then - change `NEXT_PUBLIC_URL` in `/app/config.ts` to a production URL or the ngrok tunnel below

Then - change project name at ``` bash pinata.pinFileToIPFS(Readable.from(htmlBuffer), { pinataMetadata: { name: `PROJECTNAME/${profileName}/index.html` } } ```

Then - change the ens domain passed from route.tsx to the registerSubdomain API ie. domain: 'tweakin.eth',

```bash
pnpm install
```

## Testing

For testing using warpcast's frame validator you may want to expose your localhost server by using an ngrok tunnel.  Install ngrok - [https://ngrok.com/download](https://ngrok.com/download)

(option 1 - dev server - the subdomain API gateway may not work using dev server but UI will)
Use Frog's frame tester at http://localhost:3000/api/dev

```bash
pnpm run dev
```

(option 2 - subdomain API gateway will work )

```bash
pnpm build 
pnpm start 
```
**IN A SEPARATE TERMINAL** run the following for http://localhost:3000
```bash
ngrok http 3000 
```

[https://warpcast.com/~/developers/frames](https://warpcast.com/~/developers/frames) - Frame validator for testing

Paste in the URL from the terminal running ngrok.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

