import { Player } from './player'
import { HubTile } from './tile'
import { fillArray } from '../utils'

export class Hub {

  public readonly tiles: HubTile[]

  public constructor (public readonly owner: Player) {
    this.tiles = fillArray(4, () => new HubTile(owner))
  }

  public getFirstFreeTileOrNull (): HubTile | null {
    return this.tiles.find(tile => tile.isFree()) ?? null
  }

  public isFull (): boolean {
    return this.getFirstFreeTileOrNull() == null
  }

}
