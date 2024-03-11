export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white shadow-md rounded-lg border border-gray-200">
        <h1 className="text-2xl md:text-4xl font-bold text-zinc-900 mb-4">Sup Tweak.</h1>
        <p className="mb-6 text-zinc-600">If you've found yourself here, you'll want to go back to the warpcast app and use the frame by clicking the claim subdomain button instead of the image.</p>
        <a href="https://www.tweaklabs.xyz" className="bg-lime-600 hover:bg-lime-700 text-white font-bold py-2 px-4 rounded transition duration-300">
          Visit Tweaklabs
        </a>
      </div>
    </div>
  );
}
