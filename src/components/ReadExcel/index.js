import React, {Component} from 'react';
import {connect} from 'dva';
import {message, Modal, Button, Progress} from 'antd';
import XLSX from 'xlsx';


export default class ReadExcel extends Component {

  read = (file) => {
    const name = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const wb = XLSX.read(data, {type: 'binary'});
      console.log(name, wb);
      const {Sheets} = wb;
      Object.entries(Sheets).reduce((map, [sheetName, sheet]) => {
        const ref = sheet['!ref'];
        if (ref) {
          const [refStart, refEnd] = ref.split(':') || [];
          if (refStart && refEnd) {
            const [, refStartCol, refStartRow] = refStart.match(/^([A-Z]+)(\d+)$/) || [];
            const [, refEndCol, refEndRow] = refEnd.match(/^([A-Z]+)(\d+)$/) || [];

            const refStartColIndex = ColCharToIndex(refStartCol);
            const refEndColIndex = ColCharToIndex(refEndCol);

            const cols = {};
            for(let i=refStartColIndex; i<=refEndColIndex; i++){

            }

            console.log(refStartCol, ColCharToIndex(refStartCol), refEndCol, ColCharToIndex(refEndCol));

          }
        }
        return map;
      }, {})

    };
    reader.readAsBinaryString(file);
  };

  render() {
    return (
      <section>
        <input type="file" onChange={(e) => {
          if (e.target.files && e.target.files.length) {
            [...e.target.files].forEach(it => {
              this.read(it);
            })
          }
        }}/>
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

function IndexToColChar(index){
  const v = [];

  Math.floor(index/26)
}
