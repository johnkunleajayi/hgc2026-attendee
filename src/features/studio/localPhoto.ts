const maxPhotoBytes = 10 * 1024 * 1024
export const photoAccept = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'

function readHeader(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file.slice(0, 12))
  })
}

export async function validatePhoto(file: File) {
  if (!file.size) return 'This file is empty. Choose another photo.'
  if (file.size > maxPhotoBytes) return 'Choose a photo that is 10 MB or smaller.'

  const header = await readHeader(file)
  const matches = (signature: number[], offset = 0) =>
    signature.every((value, i) => value === header[offset + i])
  const type = matches([255, 216, 255]) ? 'image/jpeg'
    : matches([137, 80, 78, 71, 13, 10, 26, 10]) ? 'image/png'
    : matches([82, 73, 70, 70]) && matches([87, 69, 66, 80], 8) ? 'image/webp' : ''
  if (!type || (file.type && file.type !== type && file.type !== 'application/octet-stream')) {
    return 'Choose a JPEG, PNG or WebP image.'
  }
  return ''
}
