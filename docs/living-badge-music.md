# Redeemed Anthem integration

The original `src/assets/audio/redeemed-anthem.ogg` is the supplied Desktop recording, copied byte for byte. It is approximately 12.29 seconds of mono Opus at 48 kHz. The source and project copy have SHA-256 `4b3f900f66e012eb663feb3af6a4323b80b5b0d3f4d7dda46e5986958e4bb528`.

The header owns one looping audio element across both routes. It tries audible autoplay once at 25% element volume. When the browser blocks autoplay, Play Music starts from a user gesture. Pause retains the current position. Stop rewinds and leaves playback stopped across route changes. The player uses the browser's Ogg/Opus support. Reduced motion remains independent of audio.

The export derivative `src/assets/audio/redeemed-anthem-export.m4a` contains the first six seconds of the same recording, 48 kHz mono AAC-LC, with a fade from 5.6 to 6 seconds. A silence scan found no intervals longer than 200 ms below −45 dB in that excerpt. FFmpeg generated it locally:

```powershell
ffmpeg -i src/assets/audio/redeemed-anthem.ogg -t 6 -af "afade=t=out:st=5.6:d=0.4" -ar 48000 -c:a aac -b:a 128k -movflags +faststart src/assets/audio/redeemed-anthem-export.m4a
```

The existing Mediabunny encoder demuxes the AAC asset, skips its negative-timestamp priming packet, and interleaves the timed AAC packets with the existing H.264 frames. The export uses the local asset independently of player state. It retains the existing WebCodecs H.264 capability check and requires no browser AAC encoder. PNG and GIF use their existing image-only paths. No new application dependency was added.

For local validation, serve the production preview on port 4187 and run `node validation/music/verify.mjs`. Run `python validation/music/check_audio.py <path-to-ffmpeg.exe>` to verify the exported audio against the AAC excerpt and decode the video stream.


## Validation results

TypeScript, ESLint, all 24 existing tests and the production build passed. Edge verified blocked and permitted autoplay, looping, manual play, pause, resume, stop and a single player across navigation. The music controls remained visible at 375, 768, 1024 and 1440 px under reduced motion. Square PNG and GIF downloaded at their existing resolutions. Three downloaded MP4s contained 180 H.264 frames and a 48 kHz mono AAC track with both tracks starting at zero and lasting six seconds. Those exports were made with site music stopped, playing and paused respectively. FFmpeg decoded 288,000 non-silent audio samples from each and matched the excerpt after initial AAC decoder overlap. The Portrait sample also played in Edge unmuted. Browser testing covered Edge viewport emulation.
