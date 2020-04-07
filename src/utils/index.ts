export function fillArray<T> (length: number, create: (index: number) => T): Array<T> {
  return Array.from({ length }).map((_, i) => create(i))
}

export function fillArrayFlat<T> (length: number, create: (index: number) => Array<T>): Array<T> {
  return Array.from({ length }).flatMap((_, i) => create(i))
}

export function pairwiseCircular<T> (array: Array<T> | ReadonlyArray<T>): Array<[T, T]> {
  const result: Array<[T, T]> = []
  for (let i = 0; i < array.length - 1; i++) {
    result.push([array[i], array[i + 1]])
  }
  result.push([array[array.length - 1], array[0]])
  return result
}

export function pairwise<T> (array: Array<T> | ReadonlyArray<T>): Array<[T, T]> {
  const result: Array<[T, T]> = []
  for (let i = 0; i < array.length - 1; i++) {
    result.push([array[i], array[i + 1]])
  }
  return result
}

export function clamp (lo: number, hi: number) {
  return (value: number) => {
    return Math.max(lo, Math.min(hi, value))
  }
}

