'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [vttUrl, setVttUrl] = useState('');
  const [captionedVideoUrl, setCaptionedVideoUrl] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setTranscript('');
    setVideoUrl('');
    setVttUrl('');
    setCaptionedVideoUrl('');
    setStatus('Uploading and transcribing...');

    if (!file) {
      setStatus('Please select a video file.');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setStatus(`Failed: ${err.error || 'Unknown error'}`);
        return;
      }

      const result = await res.json();
      const fullTranscript = result.transcript || '';
      const vttFile = result.vttFile;
      const captionedFile = result.captionedFile;

      setTranscript(fullTranscript);
      setVideoUrl(`/uploads/${file.name}`);
      setVttUrl(`/uploads/${vttFile}`);
      setCaptionedVideoUrl(`/uploads/${captionedFile}`);
      setStatus('Transcription complete!');
    } catch (error) {
      console.error(error);
      setStatus('An error occurred during upload.');
    }
  };

  return (
    <div className="space-y-4 max-w-xl w-full relative">
      <form onSubmit={handleUpload} className="space-y-4 flex justify-center items-center gap-4">
  <input
    type="file"
    accept="video/*"
    onChange={(e) => setFile(e.target.files[0])}
    className="file:ml-3 file:mt-3 file:py-2 file:px-4 file:rounded file:border-0 file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
  />
  <button
    type="submit"
    className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
  >
    Upload Video
  </button>
</form>


      {status && (
        <p className="text-lg text-center font-semibold text-green-600 animate-pulse">
          {status}
        </p>
      )}


      {videoUrl && (
        <div className="mt-6 w-full relative space-y-4">
          <video
            src={videoUrl}
            controls
            className="w-full h-auto rounded"
            crossOrigin="anonymous"
          >
            {vttUrl && (
              <track
                label="English"
                kind="subtitles"
                srcLang="en"
                src={vttUrl}
                default
              />
            )}
          </video>

          
        </div>
      )}
    </div>
  );
}
