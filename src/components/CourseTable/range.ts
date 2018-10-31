import Point, {IPoint} from './point';

export interface IRange {
  start: IPoint;
  end: IPoint;

  contains(point: IPoint): boolean;

  containsX(point: IPoint): boolean;

  containsY(point: IPoint): boolean;
}

/**
 * 区间
 */
export default class Range implements IRange {

  private _list: Array<IPoint>;

  constructor(start: IPoint, end: IPoint) {
    this._list = [start, end].sort(Point.compare);
  }

  get start() {
    return this._list[0];
  }

  get end() {
    return this._list[1];
  }

  contains(point: IPoint): boolean {
    return (
      Point.compare(this._list[0], point) <= 0 &&
      Point.compare(point, this._list[1]) <= 0
    );
  }

  containsX(point: IPoint): boolean {
    return (
      Point.compareX(this._list[0], point) <= 0 &&
      Point.compareX(point, this._list[1]) <= 0
    );
  }

  containsY(point: IPoint): boolean {
    return (
      Point.compareY(this._list[0], point) <= 0 &&
      Point.compareY(point, this._list[1]) <= 0
    );
  }
}
