import { Player } from './player'
import { CourseTile, FinishTile, HubTile, StartTile, Tile } from './tile'
import { fillArray, pairwise, pairwiseCircular } from '../utils'

// TODO: This should be in some config, injected everywhere
const COLORS = [0x3bb900, 0xfe0000, 0x0085c8, 0xffbe00]

export class Board {

  public constructor (
    public readonly players: ReadonlyArray<Player>,
  ) {
    this.players = players

    players.forEach(player => {
      this.startTiles.set(player, new StartTile(player))
    })

    const regularTilesDefinitions = players.map(player => {
      return [player, fillArray(10, () => new CourseTile())] as const
    })
    const regularTiles = new Map<Player, Array<Tile>>(regularTilesDefinitions)

    const tilesBeforeFinish = new Map<Player, Tile>(players.map(player => [player, new CourseTile()] as const))

    players.forEach(player => {
      this.finishes.set(player, fillArray(4, () => new FinishTile(player)))
    })

    pairwiseCircular(players).forEach(([leftPlayer, rightPlayer]) => {
      const leftPlayerStartTile = this.startTiles.get(leftPlayer)!
      leftPlayerStartTile.next.push(regularTiles.get(leftPlayer)![0])

      const leftPlayerRegularTiles = regularTiles.get(leftPlayer)!
      pairwise(leftPlayerRegularTiles).forEach(([leftTile, rightTile]) => { leftTile.next.push(rightTile) })

      const rightPlayerTileBeforeFinish = tilesBeforeFinish.get(rightPlayer)!
      const leftPlayerLastRegularTile = leftPlayerRegularTiles[leftPlayerRegularTiles.length - 1]
      leftPlayerLastRegularTile.next.push(rightPlayerTileBeforeFinish)

      const leftPlayerTileBeforeFinish = tilesBeforeFinish.get(leftPlayer)!
      const leftPlayerFinishTiles = this.finishes.get(leftPlayer)!
      const leftPlayerFirstFinishTile = leftPlayerFinishTiles[0]
      leftPlayerTileBeforeFinish.next.push(leftPlayerStartTile, leftPlayerFirstFinishTile)

      this.course.push(leftPlayerStartTile, ...leftPlayerRegularTiles, rightPlayerTileBeforeFinish)
    })

    players.forEach(player => {
      const startTile = this.startTiles.get(player)!
      player.hub.tiles.forEach(hubTile => {
        hubTile.next.push(startTile)
      })
    })
  }

  public readonly startTiles = new Map<Player, StartTile>()
  public readonly course: Array<Tile> = []
  public readonly finishes = new Map<Player, Array<FinishTile>>()

}
