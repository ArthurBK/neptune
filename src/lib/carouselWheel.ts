type Axis = 'horizontal' | 'vertical' | null

/** Classify a stream of normalized wheel deltas, ignoring jitter and momentum. */
export function createCarouselWheelGesture() {
  let axis: Axis = null
  let lastEventAt = -Infinity
  let lastMagnitude = 0
  let horizontalEvidence = 0
  let momentumFloor = Infinity
  let distanceX = 0
  let distanceY = 0
  let consumedAt = -Infinity
  let consumed = false
  let direction = 0

  return (deltaX: number, deltaY: number, time: number): { axis: Axis; direction: number } => {
    const x = Math.abs(deltaX)
    const y = Math.abs(deltaY)
    horizontalEvidence = x > y * 1.25
      ? (Math.sign(horizontalEvidence) === Math.sign(deltaX) ? horizontalEvidence + deltaX : deltaX)
      : 0
    const horizontalIntent = (x >= 12 || Math.abs(horizontalEvidence) >= 16) && x > y * 1.25
    const renewedHorizontalIntent = horizontalIntent && (
      axis === 'vertical' ||
      (consumed && time - consumedAt >= 180 && (
        Math.sign(deltaX) !== direction || (x >= 8 && x >= momentumFloor * 3)
      ))
    )
    const renewedVerticalIntent = axis === 'horizontal' && y >= 20 && y > x * 1.5 &&
      y > lastMagnitude * 2 && time - consumedAt >= 180

    // A fresh push or direction change can start before the previous momentum
    // ends. Waiting exclusively for a silent gap would discard that gesture.
    if (time - lastEventAt >= 160 || renewedHorizontalIntent || renewedVerticalIntent) {
      axis = null
      distanceX = 0
      distanceY = 0
      consumed = false
      momentumFloor = Infinity
    }
    lastEventAt = time
    lastMagnitude = Math.max(x, y)
    if (consumed) momentumFloor = Math.min(momentumFloor, x)

    if (!consumed) {
      distanceX += deltaX
      distanceY += deltaY
    }
    const totalX = Math.abs(distanceX)
    const totalY = Math.abs(distanceY)
    // Confirm intent across several small events instead of locking on the
    // first fractional delta. Larger diagonal gestures use the dominant axis.
    if (!axis && Math.max(totalX, totalY) >= 10) {
      if (totalX > totalY * 1.15) axis = 'horizontal'
      else if (totalY > totalX * 1.15) axis = 'vertical'
      else if (Math.max(totalX, totalY) >= 32) axis = totalX >= totalY ? 'horizontal' : 'vertical'
    }

    if (axis === 'horizontal' && !consumed && totalX >= 32) {
      consumed = true
      consumedAt = time
      momentumFloor = x
      direction = Math.sign(distanceX)
      return { axis, direction }
    }
    return { axis, direction: 0 }
  }
}
