import { writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';

export async function POST(req) {
  const data = await req.formData();
  const file = data.get('video');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file received' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const filePath = path.join(uploadDir, file.name);
  const baseName = path.parse(file.name).name;
  const vttPath = path.join(uploadDir, `${baseName}.vtt`);

  await writeFile(filePath, buffer);

  const python = spawn('python', ['transcribe.py', filePath]);

  let output = '';
  let error = '';

  for await (const chunk of python.stdout) {
    output += chunk.toString();
  }

  for await (const chunk of python.stderr) {
    error += chunk.toString();
  }

  const exitCode = await new Promise((resolve) => {
    python.on('close', resolve);
  });

  if (exitCode !== 0) {
    console.error('Whisper error:', error);
    return NextResponse.json({ error: 'Transcription failed', details: error }, { status: 500 });
  }

  let parsed;
  try {
    parsed = JSON.parse(output); // { transcript, segments }
  } catch (e) {
    console.error('JSON parse error:', e, output);
    return NextResponse.json({ error: 'Invalid transcription output' }, { status: 500 });
  }

  // ✅ Convert segments to VTT format
  const vttContent = generateVTT(parsed.segments);

  try {
    await writeFile(vttPath, vttContent);
  } catch (e) {
    console.error('VTT write error:', e);
    return NextResponse.json({ error: 'Failed to write VTT file' }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Transcription complete',
    transcript: parsed.transcript.trim(),
    segments: parsed.segments,
    vttFile: `${baseName}.vtt`
  });
}

// --- Helper: Convert segments to WebVTT format ---
function generateVTT(segments) {
  const toTimestamp = (seconds) => {
    const date = new Date(seconds * 1000).toISOString();
    return date.substr(11, 8) + '.' + String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
  };

  const entries = segments.map((seg, i) => {
    return `${i + 1}\n${toTimestamp(seg.start)} --> ${toTimestamp(seg.end)}\n${seg.text.trim()}\n`;
  });

  return `WEBVTT\n\n${entries.join('\n')}`;
}
