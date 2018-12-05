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
    }
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
