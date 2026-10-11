import math, struct, wave
from pathlib import Path
rate=24000; seconds=12
notes=[261.63,329.63,392.00,523.25,440.00,392.00,329.63,293.66]
with wave.open('public/media/demo-audio.wav','wb') as audio:
 audio.setnchannels(1);audio.setsampwidth(2);audio.setframerate(rate)
 samples=bytearray()
 for i in range(rate*seconds):
  t=i/rate; beat=int(t/.75)%len(notes); local=t%.75; envelope=min(1,local/.035)*math.exp(-local*2.8)
  value=math.sin(2*math.pi*notes[beat]*t)*envelope*.22+math.sin(2*math.pi*130.815*t)*.035
  samples.extend(struct.pack('<h',int(value*24000)))
 audio.writeframes(samples)
print('WAV 12 seconds, 24 kHz, mono')
