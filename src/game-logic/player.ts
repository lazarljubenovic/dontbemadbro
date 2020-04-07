import { Figure } from './figure'
import { Move } from './move'
import { HubTile } from './tile'
import { Hub } from './hub'

export class Player {

  protected name: string = '<player>'

  protected color: number = 0

  public figures: Array<Figure> = [
    new Figure(this, 'figure_' + this.name + '_0'),
    new Figure(this, 'figure_' + this.name + '_1'),
    new Figure(this, 'figure_' + this.name + '_2'),
    new Figure(this, 'figure_' + this.name + '_3'),
  ]

  public hub: Hub = new Hub(this)

  public constructor () {
    this.hub.tiles.forEach((hubTile, index) => {
      const figure = this.figures[index]
      figure.setTile(hubTile)
    })
  }

  public setName (name: string): this {
    this.name = name
    return this
  }

  public getName (): string {
    return this.name
  }

  public setColor (color: number): this {
    this.color = color
    return this
  }

  public getColor (): number {
    return this.color
  }

  public getPossibleMoves (moveLength: number): Array<Move> {
    return this.figures.flatMap(figure => {
      const paths = figure.tile!.getPossiblePaths(moveLength)
      return paths.map(path => new Move(figure, path))
    })
  }

  public getFiguresInHub (): Figure[] {
    return this.figures.filter(figure => figure.tile instanceof HubTile)
  }

  public getFiguresInHubCount (): number {
    return this.getFiguresInHub().length
  }

}
