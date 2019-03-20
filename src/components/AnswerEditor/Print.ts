export class Print {

  dpi: number = 96;

  type: string = 'A4';

  width: number;

  height: number;

  w: number;

  h: number;

  direction: string;

  pageCount: number;

  padding: number[];

  colCount: number;

  colSpan: number;
}

export class KeyElement {
  static CID = 0;
  static MAP = {};

  key: number = KeyElement.CID++;

  constructor(opt: object) {
    Object.assign(this, opt);
    KeyElement.MAP[this.key] = this;
  }
}

export class KeyElementList {
  private _list: KeyElement[] = [];

  push(item: KeyElement): number {
    return this._list.push(item);
  }

  pop(): KeyElement | undefined {
    return this._list.pop();
  }

  shift(): KeyElement | undefined {
    return this._list.shift();
  }

  unshift(item: KeyElement): number {
    return this._list.unshift(item);
  }

  forEach(fn: (item: KeyElement, index: number) => void) {
    this._list.forEach(fn);
  }

  reduce(fn: (result: any, item: KeyElement, index: number) => any, initValue: any): any {
    return this._list.reduce(fn, initValue);
  }

  map(fn: (item: KeyElement, index: number) => any[]): any[] {
    return this._list.map(fn);
  }
}
