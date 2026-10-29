import test from 'node:test'
import assert from 'node:assert/strict'
import { findPhotoBounds, fitPhotoBounds } from '../src/lib/photoBounds.ts'

test('link bounds exclude artwork margins and the separate caption', () => {
  const width = 200
  const height = 120
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) data.set([242, 240, 240, 255], i)
  const rect = (left, top, right, bottom, color) => {
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) data.set(color, (y * width + x) * 4)
  }
  rect(50, 20, 150, 90, [255, 255, 255, 255])
  rect(55, 25, 145, 85, [40, 60, 80, 255])
  rect(65, 95, 135, 98, [0, 0, 0, 255])
  assert.deepEqual(findPhotoBounds(data, width, height), { left: 0.25, top: 1 / 6, width: 0.5, height: 7 / 12 })
})

test('desktop cover and hotspot position keep the link over the photograph', () => {
  assert.deepEqual(fitPhotoBounds({ left: 0.25, top: 0.2, width: 0.5, height: 0.5 }, 1600, 900, 1200, 900, true, 1, [0.5, 0.5]), {
    left: 200, top: 180, width: 800, height: 450,
  })
  assert.equal(fitPhotoBounds({ left: 0.25, top: 0.2, width: 0.5, height: 0.5 }, 1600, 900, 1200, 900, true, 1, [1, 0.5]).left, 0)
})

test('mobile contain scaling keeps the link inside the visible framed image', () => {
  const bounds = fitPhotoBounds({ left: 0.3, top: 0.2, width: 0.4, height: 0.5 }, 1600, 900, 400, 600, false, 2.3, [0.5, 0.5])
  assert.ok(Math.abs(bounds.left - 16) < 0.001)
  assert.ok(Math.abs(bounds.top - 144.75) < 0.001)
  assert.equal(bounds.width, 368)
  assert.equal(bounds.height, 258.75)
})
