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
import warning from 'warning';


function CellError({errors}) {
  return (
    <ul>
      {
        errors.map((it, index) =>
          <li key={index}>{it.message}</li>
        )
      }
    </ul>
  )
}

function Cell(props) {
  const {value, errors} = props;
  let title = null;
  if (errors && errors.length) {
    title = errors.map(it => it.message).join('\n')
  }

  return (
    <span className={[errors ? styles['error'] : '', value ? '' : styles['null-value']].join(' ')} title={title}>
      {value || title}
      {/*{*/}
        {/*errors ?*/}
          {/*<CellError errors={errors}/>*/}
          {/*:*/}
          {/*null*/}
      {/*}*/}
    </span>
  )
}

function ReadExcelView(props) {
  const {data = {}, onChange} = props;

  const sheets = Object.entries(data);


  return (
    <section className="list-table-container">
      {
        sheets.length ?
          <Tabs>
            {
              sheets.map(([sheetName, sheet]) =>
                <Tabs.TabPane key={sheetName} tab={`${sheetName}(共${sheet.list.length}行)`}>
                  <Table className="list-table"
                         pagination={false}
                         columns={stdColumns([
                           {title: '行号', key: 'index', width: 30},
                           ...sheet.headers.map(key => ({
                             key,
                             title: key,
                             render: v => v ? <Cell {...v} /> : null
                           })),
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
          :
          null
      }
    </section>
  );


}

export default class ReadExcel extends Component {

  static read = read;
  static validate = validate;
  static transform = transform;

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
          ReadExcel.read(files[0])
            .then(data => fields ? ReadExcel.validate(data, fields) : data)
            .then(data => onChange({data}));
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
            <ReadExcelView data={data} onChange={(data) => onChange({data})}/>
            :
            '选择文件或拖放文件'
        }
      </FileInput>
    )
  }
}


export function read(file) {
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
  })
}

export function validate(data = {}, fields = {}) {
  const fieldKeys = [];
  const descriptor = Object.entries(fields).reduce((map, [key, options]) => {
    fieldKeys.push(key);
    if (options.rules) {
      map[key] = options.rules
    }
    return map;
  }, {});

  const sheets = Object.entries(data).reduce((arr, [name, sheet]) => {
    arr.push({name, ...sheet});
    return arr;
  }, []);

  return pipes(
    sheet => {
      return pipes(
        rs => new Promise((resolve) => {
          const validator = new Schema(descriptor);
          validator.validate(
            Object.entries(rs).reduce((map, [key, o]) => {
              map[key] = o.value;
              return map;
            }, {}),
            (errors) => {
              if (errors && errors.length) {
                const em = errors.reduce((map, {message, field}) => {
                  const es = map[field] || [];
                  es.push({message});
                  map[field] = es;
                  return map;
                }, {});
                fieldKeys.forEach(key => {
                  if (em[key]) {
                    rs[key] = rs[key] || {};
                    rs[key].errors = em[key];
                  } else if (rs[key]) {
                    delete rs[key].errors;
                  }
                });
              }
              resolve(rs);
            });
        })
      )(...sheet.list).then((list) => {
        sheet.list = list;
        return sheet;
      })
    }
  )(...sheets).then((sheets) => {
    return sheets.reduce((map, sheet) => {
      map[sheet.name] = sheet;
      return map;
    }, {})
  });
}

export function transform(data, fields = {}) {
  const fieldList = Object.entries(fields).reduce((list, [key, options]) => {
    list.push({key, k: options && options.key || options || key});
    return list;
  }, []);

  let errors = [];
  const list = Object.values(data).reduce((list, sheet) => {
    sheet.list.reduce((list, it) => {
      list.push(fieldList.reduce((o, {key, k}) => {
        const m = it[key];
        if (m) {
          if (m.errors) {
            errors = errors.concat(m.errors);
          }
          o[k] = m.value;
        }
        return o;
      }, {}));
      return list;
    }, list);
    return list;
  }, []);
  if (errors.length) {
    return {errors};
  }
  return {list};
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
