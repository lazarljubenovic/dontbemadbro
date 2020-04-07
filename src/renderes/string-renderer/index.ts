import { Board } from '../../game-logic/board'

// TODO: Move this out of this file
interface Renderer<TResult> {

  render (board: Board): TResult

}

export class StringRenderer implements Renderer<string> {

  public render (board: Board): string {
    const lines: string[] = []

    lines.push(`== HUBS ==`)
    board.players.forEach(player => {
      lines.push(player.getName() + ' :: ' + player.getFiguresInHubCount())
    })

    return lines.join('\n')
  }

}
