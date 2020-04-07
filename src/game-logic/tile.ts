import { Figure } from './figure'
import { Player } from './player'

export abstract class Tile {

  /**
   * For debugging, logging and serialization.
   */
  public name: string = '<tile>'

  /**
   * Set of tiles that player might be able jump to. Just because there's
   * a connection, it doesn't mean that a player can necessarily jump there.
   */
  public readonly next: Tile[] = []

  public figure: Figure | null = null

  /**
   * Get all possible paths to destinations where the figure can land if
   * it needs to move by exactly the given amount of tiles.
   *
   * @param moveLength - The length of the move.
   */
  public getPossiblePaths (moveLength: number): Array<Array<Tile>> {
    return this._getPossiblePaths(moveLength, [])
  }

  protected _getPossiblePaths (moveLength: number, collected: Array<Tile>): Array<Array<Tile>> {
    if (moveLength == 0) return [collected]
    return this.next.flatMap(nextTile => nextTile._getPossiblePaths(moveLength - 1, [...collected, nextTile]))
  }

  public isFree (): boolean {
    return this.figure == null
  }

  public abstract canBePassedThroughBy (figure: Figure): boolean

  /**
   *
   * @param source The tile that the player is jumping from.
   * @param path The path that the figure will make by moving to the destination.
   * @param figure Tile figure that wants to make the move.
   */
  public abstract canLand (source: Tile, path: Array<Tile>, figure: Figure): boolean

}

export class HubTile extends Tile {

  public constructor (public readonly owner: Player) {
    super()
  }

  public canBePassedThroughBy (figure: Figure): boolean {
    return false
  }

  public canLand (source: Tile, path: Array<Tile>, figure: Figure): boolean {
    return false
  }

}

export class CourseTile extends Tile {

  public canBePassedThroughBy (figure: Figure): boolean {
    return true
  }

  public canLand (source: Tile, path: Array<Tile>, figure: Figure): boolean {
    return true
  }

}

export class StartTile extends CourseTile {

  public constructor (public readonly owner: Player) {
    super()
  }

  public canBePassedThroughBy (figure: Figure): boolean {
    return figure.player != this.owner || figure.tile instanceof HubTile
  }

  public canLand (source: Tile, path: Array<Tile>, figure: Figure): boolean {
    return true
  }

}

export class FinishTile extends Tile {

  public constructor (public readonly owner: Player) {
    super()
  }

  public canBePassedThroughBy (figure: Figure): boolean {
    return this.figure == null
  }

  public canLand (source: Tile, path: Array<Tile>, figure: Figure): boolean {
    return true
  }

}
