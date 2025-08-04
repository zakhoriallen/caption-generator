import UploadForm from './UploadForm';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Video Caption Generator</h1>
      <p className="mb-4 text-center max-w-xl text-gray-600">
        Upload a video file and automatically generate accurate captions
      </p>
      <UploadForm />
    </main>
  );
}