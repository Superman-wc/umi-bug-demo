import Point, {IPoint} from './point';

export interface IRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * 矩形
 */
export default class Rect implements IRect {

  left: number;
  top: number;
  width: number;
  height: number;

  constructor(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  isOverlap(rect: IRect): boolean {
    return (
      this.left + this.width > rect.left &&
      rect.left + rect.width > this.left &&
      this.top + this.height > rect.top &&
      rect.top + rect.height > this.top
    )
  }
}
