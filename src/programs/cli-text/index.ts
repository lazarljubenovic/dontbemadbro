import { StringRenderer } from '../../renderes/string-renderer'
import { Board } from '../../game-logic/board'
import { Player } from '../../game-logic/player'
import { fillArray } from '../../utils'

export default function main () {
  const renderer = new StringRenderer()
  const colors = [0x3bb900, 0xfe0000, 0x0085c8, 0xffbe00]
  const board = new Board(fillArray(4, (index) => new Player().setColor(colors[index])))
  const string = renderer.render(board)
  console.log(string)
}
