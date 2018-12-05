import React, {Component} from 'react';
import {connect} from 'dva';
import {message, Modal, Button, Progress, Table, Tabs} from 'antd';
import XLSX from 'xlsx';
import {stdColumns} from '../ListPage';
import TableCellOperation from '../TableCellOperation';


const INDEX = Symbol('index');

export default class ReadExcel extends Component {

  state = {};

  read = (file) => {
    const name = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
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
                  o[cols[col]] = sheet[col + i] ? {value: sheet[col + i].v} : undefined;
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

      // console.log(data);

      this.setState({data})

    };
    reader.readAsBinaryString(file);
  };

  render() {
    const {data = {}} = this.state;

    return (
      <section className="list-table-container">
        <input type="file" onChange={(e) => {
          if (e.target.files && e.target.files.length) {
            [...e.target.files].forEach(it => {
              this.read(it);
            })
          }
        }}/>
        <Tabs>
          {
            Object.entries(data).map(([sheetName, sheet]) =>
              <Tabs.TabPane key={sheetName} tab={`${sheetName}(${sheet.list.length}行)`}>
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
                                   this.setState({data: {...data}});
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
    )
  }
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
