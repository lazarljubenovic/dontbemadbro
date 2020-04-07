interface Point {
  x: number,
  y: number
}

type DraggingListener = (point: Point) => void

type DragEventType = 'draggingStart' | 'dragging' | 'draggingEnd'


export class MouseHandler {

  private isMouseDown: boolean = false
  private isDragging: boolean = false

  private listeners: Record<DragEventType, Set<DraggingListener>> = {
    draggingStart: new Set(),
    dragging: new Set(),
    draggingEnd: new Set(),
  }

  public constructor () {
    document.addEventListener('mousedown', (event) => {
      this.isMouseDown = true
    })

    document.addEventListener('mousemove', (event) => {
      if (!this.isMouseDown) return
      if (!this.isDragging) {
        this.isDragging = true
        const point = { x: event.clientX, y: event.clientY }
        this.emitEvent('draggingStart', point)
      } else {
        const movement = { x: event.movementX, y: event.movementY }
        this.emitEvent('dragging', movement)
      }
    })

    document.addEventListener('mouseup', (event) => {
      this.isMouseDown = false
      this.isDragging = false
      const point = { x: event.clientX, y: event.clientY }
      this.emitEvent('draggingEnd', point)
    })
  }

  public listen (eventName: DragEventType, fn: DraggingListener) {
    this.listeners[eventName].add(fn)
    return () => { this.listeners[eventName].delete(fn) }
  }

  public unlistenAll (): void {
    this.listeners.draggingStart.clear()
    this.listeners.dragging.clear()
    this.listeners.draggingEnd.clear()
  }

  private emitEvent (type: DragEventType, point: Point): void {
    this.listeners[type].forEach(fn => fn(point))
  }

}
