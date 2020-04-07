type Listener<T> = (t: T) => void

export class GamepadHandler {

  private readonly deadZone = 0.1

  private _gamepad?: Gamepad

  public get state (): Gamepad | undefined {
    return this._gamepad
  }

  private readonly listeners = new Set<Listener<Gamepad>>()

  public constructor () {
    window.addEventListener('gamepadconnected' as any, (event: GamepadEvent) => {
      this.requestAnimationFrame()
    })
  }

  public listen (fn: (gamepad: Gamepad) => void) {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  private onAnimationFrame () {
    const [gamepad] = navigator.getGamepads()
    if (gamepad == null) return
    this._gamepad = gamepad
    // console.log('new')
    this.listeners.forEach(fn => fn(gamepad))
    this.requestAnimationFrame()
  }

  private requestAnimationFrame () {
    // setTimeout(() => this.onAnimationFrame(), 500)
    requestAnimationFrame(() => this.onAnimationFrame())
  }

}
