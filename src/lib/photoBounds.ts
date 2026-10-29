export interface PhotoBounds {
  left: number
  top: number
  width: number
  height: number
}

// Artwork can include a flat background and a caption. Keep the largest band
// of non-background pixels (the framed photograph), excluding the caption.
export function findPhotoBounds(data: Uint8ClampedArray, width: number, height: number): PhotoBounds {
  let best = { top: 0, bottom: 0, left: width, right: 0 }
  let band = { ...best }
  const finishBand = () => {
    if (band.bottom - band.top > best.bottom - best.top) best = { ...band }
    band = { top: 0, bottom: 0, left: width, right: 0 }
  }
  for (let y = 0; y < height; y++) {
    let left = width
    let right = 0
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4
      if (data[offset + 3] > 128 && (
        Math.abs(data[offset] - data[0]) > 8 ||
        Math.abs(data[offset + 1] - data[1]) > 8 ||
        Math.abs(data[offset + 2] - data[2]) > 8 || data[3] < 128
      )) {
        left = Math.min(left, x)
        right = x + 1
      }
    }
    if (right - left > width * 0.02) {
      if (band.bottom === 0) band.top = y
      band.bottom = y + 1
      band.left = Math.min(band.left, left)
      band.right = Math.max(band.right, right)
    } else {
      finishBand()
    }
  }
  finishBand()
  if (best.bottom - best.top < height * 0.15) return { left: 0, top: 0, width: 1, height: 1 }
  return { left: best.left / width, top: best.top / height, width: (best.right - best.left) / width, height: (best.bottom - best.top) / height }
}

export function fitPhotoBounds(bounds: PhotoBounds, imageWidth: number, imageHeight: number, boxWidth: number, boxHeight: number, cover: boolean, scale: number, position: [number, number]): PhotoBounds {
  const fit = (cover ? Math.max : Math.min)(boxWidth / imageWidth, boxHeight / imageHeight)
  const width = imageWidth * fit
  const height = imageHeight * fit
  return {
    left: boxWidth * (1 - scale) / 2 + ((boxWidth - width) * position[0] + bounds.left * width) * scale,
    top: boxHeight * (1 - scale) / 2 + ((boxHeight - height) * position[1] + bounds.top * height) * scale,
    width: bounds.width * width * scale,
    height: bounds.height * height * scale,
  }
}
