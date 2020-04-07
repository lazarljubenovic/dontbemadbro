import { Tile } from './tile'
import { Player } from './player'

export class Figure {

  public tile: Tile | null = null

  public player: Player

  public constructor (
    player: Player,
    public readonly name: string,
  ) {
    this.player = player
  }

  public getPossiblePaths (moveLength: number): Array<Array<Tile>> {
    if (this.tile == null) return []
    return this.tile.getPossiblePaths(moveLength)
  }

  /**
   * Just set the tile property.
   *
   * @param tile
   */
  public setTile (tile: Tile): this {
    this.tile = tile
    return this
  }

  /**
   * "Move" as seen through the game. No checks for validity of the move.
   * @param tile
   */
  public moveTo (tile: Tile): this {
    if (this.tile != null) {
      this.tile.figure = null
    }
    tile.figure = this
    return this.setTile(tile)
  }

  public kickToHub () {

  }

}
