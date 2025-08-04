import sys
import json
import whisper
from datetime import timedelta
import os

def format_timestamp(seconds):
    td = timedelta(seconds=seconds)
    s = str(td)
    if '.' not in s:
        s += '.000'
    return s[:s.index('.') + 4].replace('.', ',')

model = whisper.load_model("base")

# Get video path from CLI argument
audio_path = sys.argv[1]

# Transcribe the audio
result = model.transcribe(audio_path, word_timestamps=False)

# Prepare output segments
segments = [
    {
        "start": round(segment["start"], 2),
        "end": round(segment["end"], 2),
        "text": segment["text"].strip()
    }
    for segment in result.get("segments", [])
]

# Generate .vtt filename (same as video, different extension)
vtt_filename = os.path.splitext(os.path.basename(audio_path))[0] + '.vtt'
vtt_path = os.path.join(os.path.dirname(audio_path), vtt_filename)

# Write WebVTT file
with open(vtt_path, 'w', encoding='utf-8') as f:
    f.write("WEBVTT\n\n")
    for segment in segments:
        f.write(f"{format_timestamp(segment['start'])} --> {format_timestamp(segment['end'])}\n")
        f.write(segment['text'] + "\n\n")

# Output JSON
output = {
    "transcript": result.get("text", ""),
    "segments": segments,
    "vttFile": vtt_filename
}

print(json.dumps(output))
