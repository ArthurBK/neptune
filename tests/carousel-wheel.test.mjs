import assert from 'node:assert/strict'
import test from 'node:test'
import { createCarouselWheelGesture } from '../src/lib/carouselWheel.ts'

function replay(events) {
  const gesture = createCarouselWheelGesture()
  return events.map(([x, y, time]) => gesture(x, y, time))
}

const moves = (results) => results.filter((result) => result.direction).map((result) => result.direction)

test('small initial vertical jitter does not discard a horizontal swipe', () => {
  const results = replay([[0, 1, 0], [8, 0, 16], [8, 0, 32], [8, 0, 48], [8, 0, 64]])
  assert.equal(results[0].axis, null)
  assert.deepEqual(moves(results), [1])
})

test('horizontal intent can follow vertical momentum without a silent gap', () => {
  const results = replay([[0, 60, 0], [2, 8, 16], [20, 1, 32], [15, 0, 48]])
  assert.equal(results[0].axis, 'vertical')
  assert.deepEqual(moves(results), [1])
})

test('a renewed push starts another swipe while old momentum is still arriving', () => {
  const results = replay([[60, 0, 0], [40, 0, 60], [20, 0, 120], [8, 0, 180], [3, 0, 230], [40, 0, 260]])
  assert.deepEqual(moves(results), [1, 1])
})

test('a deliberate reversal is recognized without waiting for momentum to stop', () => {
  assert.deepEqual(moves(replay([[60, 0, 0], [5, 0, 100], [-40, 0, 200]])), [1, -1])
})

test('acceleration and decaying momentum from one swipe do not skip photos', () => {
  assert.deepEqual(moves(replay([[40, 0, 0], [60, 0, 16], [30, 0, 100], [8, 0, 160], [3, 0, 220], [1, 0, 280]])), [1])
})

test('larger diagonal gestures choose the dominant axis', () => {
  assert.deepEqual(moves(replay([[25, 24, 0], [20, 18, 16]])), [1])
  const vertical = replay([[24, 25, 0], [18, 20, 16]])
  assert.deepEqual(moves(vertical), [])
  assert.equal(vertical[1].axis, 'vertical')
})

test('a deliberate vertical scroll after horizontal momentum reaches the page', () => {
  const results = replay([[40, 0, 0], [3, 0, 150], [1, 50, 210]])
  assert.equal(results[2].axis, 'vertical')
  assert.deepEqual(moves(results), [1])
})

test('separate gentle swipes work in both directions', () => {
  assert.deepEqual(moves(replay([[16, 0, 0], [16, 0, 16], [-16, 0, 250], [-16, 0, 266]])), [1, -1])
})

test('gentle horizontal movement can follow vertical scrolling', () => {
  assert.deepEqual(moves(replay([[0, 60, 0], [8, 0, 16], [8, 0, 32], [8, 0, 48], [8, 0, 64], [8, 0, 80]])), [1])
})

test('a gentle renewed push can overcome a fading momentum tail', () => {
  assert.deepEqual(moves(replay([[40, 0, 0], [4, 0, 100], [1, 0, 150], [8, 0, 220], [8, 0, 240], [8, 0, 260], [8, 0, 280], [8, 0, 300]])), [1, 1])
})
