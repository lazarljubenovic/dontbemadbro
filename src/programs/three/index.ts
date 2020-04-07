import { StringRenderer } from '../../renderes/string-renderer'
import { Board } from '../../game-logic/board'
import { Player } from '../../game-logic/player'
import { ThreeRenderer } from '../../renderes/three-renderer'
import { fillArray } from '../../utils'

export default function main () {
  const COLORS = [0x3bb900, 0xfe0000, 0x0085c8, 0xffbe00]
  const board = new Board(fillArray(4, (index) => new Player().setColor(COLORS[index])))
  const canvasEl = document.createElement('canvas')
  const renderer = new ThreeRenderer(board, canvasEl)
  document.body.prepend(canvasEl)
  renderer.initialize()
}
