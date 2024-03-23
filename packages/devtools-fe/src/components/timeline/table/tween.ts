export const createVelocity = ({
  value = 0, ds = 0.9,
  minVal = -Infinity, maxVal = Infinity
} = {}) => {
  let speed = 0

  return {
    get speed() {
      return speed
    },
    set speed(v) {
      speed = v
    },
    get value() {
      return value
    },
    update(deltaTime: number) {
      value += speed * deltaTime
      speed *= ds
      if (value < minVal) {
        value = minVal
        speed = 0
      }
      if (value > maxVal) {
        value = maxVal
        speed = 0
      }
    }
  }
}
