export interface IPoint {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IOffset extends IPoint, ISize {
}

export interface IComponent {
  key: string;
  offset: IOffset;
}

export interface IElement extends IComponent {
  type: string,
  title: string,
}

export interface IQuestion extends IElement {
  number: number,
  score: number,
  answer: string,
}

export interface IColumn extends IComponent {
  elements: IElement[];
}

export interface IColumnAttribute {
  colCount: number;
  colSpan: number;
  colWidth: number;
}

export interface IPage extends IComponent, IColumnAttribute {
  columns: IColumn[];
  padding: number[];
}

export interface IPrint extends IColumnAttribute {
  direction: string;
  dpi: number;
  h: number;
  height: number;
  w: number;
  width: number;
  padding: number[];
  pageCount: number;
  type: string;
}

export interface IFile extends IComponent {
  automatic: number;
  contentType: number;
  createdBy: number;
  dateCreated: number;
  duplex: number;
  gradeId: number;
  hasUploadCount: number;
  id: number;
  lastUpdated: number;
  pages: IPage[];
  progress: number;
  schoolId: number;
  score: number;
  status: number;
  subjectId: number;
  unitId: number;
  ver: number;
  print: IPrint;
}

export interface ICreateFilePayloadContent {
  title: string;
  choiceCount: number;
  completionCount: number;
  answerCount: number;
  content: string;
  type: number;
}

export interface ICreateFilePayloadInfo {
  grade: number[];
  subject: number;
}

export interface ICreateFilePayload {
  print: IPrint,
  content: ICreateFilePayloadContent,
  info: ICreateFilePayloadInfo
}

export function createFile(ICreateFilePayload): void {

}

