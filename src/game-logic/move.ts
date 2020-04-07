import { Figure } from './figure'
import { Tile } from './tile'

export class Move {

  public constructor (
    public figure: Figure,
    public path: Array<Tile>,
  ) {
  }

  public get moveLength (): number {
    return this.path.length
  }

}

