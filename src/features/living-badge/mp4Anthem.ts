import { BlobSource, EncodedAudioPacketSource, EncodedPacketSink, Input, MP4 } from 'mediabunny'
import type { EncodedPacket } from 'mediabunny'
import excerpt from '../../assets/audio/redeemed-anthem-export.m4a'
import { loopSeconds } from './sceneModel'

export async function prepareMp4Anthem(signal: AbortSignal) {
  const response = await fetch(excerpt, { signal })
  if (!response.ok) throw new Error('The anthem could not load.')
  const input = new Input({ source: new BlobSource(await response.blob()), formats: [MP4] })
  const packets: EncodedPacket[] = []
  let decoderConfig: AudioDecoderConfig
  try {
    const track = await input.getPrimaryAudioTrack()
    const config = await track?.getDecoderConfig()
    if (!track || !config || await track.getCodec() !== 'aac') throw new Error('The anthem is not valid AAC.')
    decoderConfig = config
    for await (const packet of new EncodedPacketSink(track).packets()) {
      signal.throwIfAborted()
      if (packet.timestamp < 0) continue
      if (packet.timestamp >= loopSeconds) break
      packets.push(packet.clone({ duration: Math.min(packet.duration, loopSeconds - packet.timestamp) }))
    }
    const last = packets.at(-1)
    if (!last || Math.abs(last.timestamp + last.duration - loopSeconds) > .001) {
      throw new Error('The anthem does not match the badge timeline.')
    }
  } finally {
    input.dispose()
  }

  const source = new EncodedAudioPacketSource('aac')
  let cursor = 0
  async function writeBefore(end: number) {
    while (cursor < packets.length && packets[cursor].timestamp < end) {
      signal.throwIfAborted()
      await source.add(packets[cursor], cursor === 0 ? { decoderConfig } : undefined)
      cursor += 1
    }
  }

  return { source, writeBefore }
}
