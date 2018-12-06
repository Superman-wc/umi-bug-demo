import React, {Component} from 'react';
import {connect} from 'dva';
import {message, Modal, Button, Progress, Table, Tabs} from 'antd';
import XLSX from 'xlsx';
import {stdColumns} from '../ListPage';
import TableCellOperation from '../TableCellOperation';
import FileInput from '../FileInput';
import styles from './index.less';
import classnames from 'classnames';
import Schema from 'async-validator';
import {pipes} from '../../utils/pipe';

function ReadExcelView(props) {
  const {data = {}, onChange} = props;

  const sheets = Object.entries(data);

  return (
    sheets.length ?
      <section className="list-table-container">
        <Tabs>
          {
            sheets.map(([sheetName, sheet]) =>
              <Tabs.TabPane key={sheetName} tab={`${sheetName}(共${sheet.list.length}行)`}>
                <Table className="list-table"
                       pagination={false}
                       columns={stdColumns([
                         {title: '行号', key: 'index', width: 30},
                         ...sheet.headers.map(key => ({key, title: key, render: v => v && v.value})),
                         {
                           title: '操作', key: 'operate',
                           render: (id, row, index) => (
                             <TableCellOperation
                               operations={{
                                 remove: () => {
                                   data[sheetName].list.splice(index, 1);
                                   onChange({...data});
                                 },
                               }}
                             />
                           ),
                         },
                       ])}
                       bordered
                       dataSource={sheet.list}
                       rowKey="index"
                />
              </Tabs.TabPane>
            )
          }
        </Tabs>
      </section>
      :
      null
  )

}

export default class ReadExcel extends Component {
  static read = read;
  state = {};

  render() {
    const {onChange, data, fields} = this.props;
    const props = {
      className: classnames(styles['component'], {
        [styles['read-excel']]: data,
        [styles['read-excel-input']]: !data,
        // [styles['drop']]: this.state.drop,
      }),
      onChange: files => {
        if (files && files.length) {
          console.log('读取Excel内容', files[0].name);
          ReadExcel.read(files[0], fields).then(data => {
            if (fields) {
              const descriptor = Object.entries(fields).reduce((map, [key, options]) => {
                if (options.rules) {
                  map[key] = options.rules
                }
                return map;
              }, {});

              const sheets = Object.values(data);

              return pipes(
                rs => new Promise((resolve) => {
                  const validator = new Schema(descriptor);
                  validator.validate(
                    Object.entries(rs).reduce((map, [key, o]) => {
                      map[key] = o.value;
                      return map;
                    }, {}),
                    (errors, o) => {
                      console.log(errors, o);
                      if (errors) {

                      }
                      resolve(rs);
                    });
                })
              )(...data);
            }
            return data;
          }).then(data => onChange({data}));
        }
      },
      selectFileEnable: !data,
      onDropChange: drop => {
        this.setState({drop});
      }
    };
    return (
      <FileInput {...props}>
        {
          data ?
            <ReadExcelView data={data} onChange={(data) => {
              onChange({data});
            }}/>
            :
            '选择文件或拖放文件'
        }
      </FileInput>
    )
  }
}


export function read(file, fields) {
  return new Promise((resolve, reject) => {
    const name = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, {type: 'binary'});
        console.log(name, wb);
        const {Sheets} = wb;
        const data = Object.entries(Sheets).reduce((map, [sheetName, sheet]) => {
          const ref = sheet['!ref'];
          if (ref) {
            const [refStart, refEnd] = ref.split(':') || [];
            if (refStart && refEnd) {
              let [, refStartCol, refStartRow] = refStart.match(/^([A-Z]+)(\d+)$/) || [];
              let [, refEndCol, refEndRow] = refEnd.match(/^([A-Z]+)(\d+)$/) || [];

              refStartRow = refStartRow * 1;
              refEndRow = refEndRow * 1;

              const refStartColIndex = ColCharToIndex(refStartCol);
              const refEndColIndex = ColCharToIndex(refEndCol);

              const cols = {};
              const colList = [];
              for (let i = refStartColIndex; i <= refEndColIndex; i++) {
                const col = IndexToColChar(i);
                colList.push(col);
                cols[col] = sheet[col + refStartRow].v;
              }
              const list = [];
              for (let i = refStartRow + 1; i <= refEndRow; i++) {
                let flag = false;
                const cell = colList.reduce((o, col) => {
                  if (sheet[col + i]) {
                    o[cols[col]] = sheet[col + i] ? {value: sheet[col + i].v.toString()} : undefined;
                    flag = true;
                  }
                  return o;
                }, {index: i});
                flag && list.push(cell);
              }

              map[sheetName] = {
                headers: colList.map(key => cols[key]),
                list
              }
            }
          }
          return map;
        }, {});
        resolve(data);
      } catch (ex) {
        reject(ex);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}


/**
 * Excel列ID转number
 * @param val
 * @returns {number}
 * @constructor
 */
function ColCharToIndex(val = 'A') {
  return val.match(/[A-Z]/g).reverse().reduce((sum, c, i) => sum + (c.charCodeAt(0) - (i ? 64 : 65)) * Math.pow(26, i), 0);
}

function IndexToColChar(index = 0) {
  const v = [];
  let s = 0;
  do {
    s = Math.floor(index / 26);
    v.push(index % 26);
    index = s;
  } while (s > 0);
  return v.map((t, i) => String.fromCharCode(t + (i ? 64 : 65))).reverse().join('')
}
