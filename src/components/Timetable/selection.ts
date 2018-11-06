import Point, { IPoint } from './point';
import Range, { IRange } from './range';

export interface ISelection {
  start: IPoint;
  end: IPoint;

  getRange(): IRange;

  isSingle: boolean;
}

export default class Selection implements ISelection {

  private _start: Point;
  private _end: Point;
  private _range: Range;

  constructor(start: Point = new Point(), end: Point = start) {
    this._start = start;
    this._end = end;
    this._range = new Range(this._start, this._end);
  }

  get start(): Point {
    return this._start;
  }

  set start(value: Point) {
    if (Point.compare(this._start, value)) {
      this._start = value;
      this._range = new Range(this._start, this._end);
    }
  }

  get end(): Point {
    return this._end;
  }

  set end(value: Point) {
    if (Point.compare(this._end, value)) {
      this._end = value;
      this._range = new Range(this._start, this._end);
    }
  }

  getRange(): Range {
    return this._range;
  }

  get isSingle(): boolean {
    return Point.compare(this._start, this._end) === 0;
  }
}
