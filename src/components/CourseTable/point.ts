export interface IPoint {
  x: number;
  y: number;
}

export default class Point implements IPoint {
  /**
   * 水平位置
   * @type {number}
   */
  x: number = 0;
  /**
   * 垂直位置
   * @type {number}
   */
  y: number = 0;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  static compare(a: IPoint, b: IPoint) {
    return Point.compareY(a, b) || Point.compareX(a, b);
  }

  static compareX(a: IPoint, b: IPoint) {
    return a.x - b.x;
  }

  static compareY(a: IPoint, b: IPoint) {
    return a.y - b.y;
  }

  add(point: IPoint) {
    this.x += point.x;
    this.y += point.y;
  }
}

export class MatrixPoint extends Point{
  x: number = 0;
  y: number = 0;
  id: symbol;
  char: string = '';

  constructor(row = 0, col = 0, index = 0, x = 0, y = 0, char:string = '') {
    super(...arguments);
    this.x = x;
    this.y = y;
    this.char = char;
    this.id = Symbol(char);
  }
}
