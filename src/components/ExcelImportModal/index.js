import React, {Component} from 'react';
import {Modal, Button, notification} from 'antd';
import ReadExcel from "../ReadExcel";
import styles from './index.less';
import {ManagesStudent} from "../../utils/namespace";

export default class ExcelImportModal extends Component {

  state = {};

  render() {
    let {
      title, visible, onCancel, onOk, fields, templateUrl
    } = this.props;
    const modalProps = {
      visible, title, onCancel,
      width: 1000, destroyOnClose: true,
      className: styles['excel-import-modal'],
      onOk: () => {
        let {errors, list} = ReadExcel.transform(this.state.data, fields);
        if (errors) {
          Modal.error({title: `数据还有${errors.length}处错误`, content: '请修改Excel文件内的错误内容后再导入'});
        } else {
          onOk({list});
        }
      },
      footer: (
        <div>
          {
            templateUrl ?
              <a href={templateUrl} target="_blank" rel="noopener noreferrer" style={{marginRight: '1em'}}>模板文件下载</a>
              :
              null
          }
          {
            this.state.data ?
              <Button onClick={() => this.setState({data: undefined})}>重新上传</Button>
              :
              null
          }
          <Button onClick={onCancel}>取消</Button>
          {
            this.state.data ?
              <Button type="primary" onClick={() => modalProps.onOk()}>导入</Button>
              :
              null
          }
        </div>
      )
    };


    return (
      <Modal {...modalProps}>
        <ReadExcel fields={fields} {...this.state} onChange={(state) => this.setState(state)}/>
      </Modal>
    )
  }
}

export function buildImportStudentProps({klass, onCancel, visible, subjectList = [], onOk, dispatch}) {

  const subjectNameMap = subjectList.reduce((map, it) => {
    map[it.name] = it;
    return map;
  }, {});

  if (!onOk) {
    onOk = (payload) => {
      dispatch({
        type: ManagesStudent + '/excelImport',
        payload: {
          klassId: klass.id,
          studentImportList: JSON.stringify(payload.list)
        },
        resolve: ({list, total}) => {
          notification.success({
            message: '导入' + (klass.name || '') + '学生，共计' + total + '条记录'
          });
          onCancel();
        }
      })
    }
  }

  return {
    title: '导入' + (klass.name || '') + '学生',
    visible,
    templateUrl: 'https://res.yunzhiyuan100.com/smart-campus/学生名单录入模板.xls',
    fields: {
      '学号': {
        key: 'code',
        rules: [{required: true, message: '请输入学号'}, {pattern: /^\d{8}$/g, message: '请输入8位数字学号'}],
      },
      '姓名': {
        key: 'name',
        rules: [{required: true, message: '请输入姓名'}]
      },
      '性别': {
        key: 'gender',
        rules: [{pattern: /男|女/g, message: '请输入"男"或"女"'}],
      },
      '选考1': {
        key: 'election1',
        rules: [{
          type: 'enum',
          enum: ['物理', '化学', '生物', '政治', '历史', '地理', '技术'],
          message: '请输入"物理"、"化学"、"生物"、"政治"、"历史"、"地理"、"技术"其中一个'
        }]
      },
      '选考1排名': {
        key: 'election1Rank',
        rules: [{
          pattern: /^\d+$/g,
          message: '请输入自然数'
        }]
      },
      '选考2': {
        key: 'election2',
        rules: [{
          type: 'enum',
          enum: ['物理', '化学', '生物', '政治', '历史', '地理', '技术'],
          message: '请输入"物理"、"化学"、"生物"、"政治"、"历史"、"地理"、"技术"其中一个'
        }, {
          validator(rule, value, callback, source, options) {
            const errors = [];
            if (source['选考2'] && source['选考1'] === source['选考2']) {
              errors.push([new Error('选考1与选考2相同')])
            }
            callback(errors);
          }
        }]
      },
      '选考2排名': {
        key: 'election2Rank',
        rules: [{
          pattern: /^\d+$/g,
          message: '请输入自然数'
        }]
      },
      '选考3': {
        key: 'election3',
        rules: [{
          type: 'enum',
          enum: ['物理', '化学', '生物', '政治', '历史', '地理', '技术'],
          message: '请输入"物理"、"化学"、"生物"、"政治"、"历史"、"地理"、"技术"其中一个'
        }, {
          validator(rule, value, callback, source, options) {
            const errors = [];
            if (source['选考3']) {
              if (source['选考1'] === source['选考3']) {
                errors.push([new Error('选考1与选考3相同')]);
              }
              if (source['选考2'] === source['选考3']) {
                errors.push([new Error('选考2与选考3相同')]);
              }
            }
            callback(errors);
          }
        }]
      },
      '选考3排名': {
        key: 'election3Rank',
        rules: [{
          pattern: /^\d+$/g,
          message: '请输入自然数'
        }]
      },
      '学考': {
        key: 'studyExaminationSubjectIds',
        width: 100,
        rules: [
          {
            transform(value) {
              return value ? value.split('/') : value;
            },
            validator(rule, value, callback, source, options) {
              const errors = [];
              const sn = {};
              if (value && Array.isArray(value)) {
                value.forEach((it, index) => {
                  if (!/^物理|化学|生物|政治|历史|地理|技术$/g.test(it)) {
                    errors.push(new Error(`第${index + 1}个"${it}"不是"物理、化学、生物、政治、历史、地理、技术"中的一个`));
                  } else {
                    if (sn[it]) {
                      errors.push(new Error(`${it}学考科目已经存在`));
                    } else {
                      sn[it] = it;
                    }
                  }
                })
              }
              callback(errors);
            }
          }
        ]
      }
    },
    onCancel,
    onOk: (payload) => {
      if (payload.list) {
        payload.list.forEach(it => {
          if (it.studyExaminationSubjectIds) {
            it.studyExaminationSubjectIds = it.studyExaminationSubjectIds.split('/').reduce((arr, sn) => {
              const subject = subjectNameMap[sn];
              if (subject) {
                arr.push(subject.id);
              }
              return arr;
            }, []).join(',')
          }
          const electionExaminationSubjectEntityList = [];
          for (let i = 1; i <= 3; i++) {
            if (it['election' + i]) {
              const sn = it['election' + i];
              const subject = subjectNameMap[sn];
              if (subject) {
                const election = {id: subject.id, name: subject.name};
                if (it['election' + i + 'Rank']) {
                  election.rank = parseInt(it['election' + i + 'Rank'], 10);
                }
                electionExaminationSubjectEntityList.push(election);
              }
            }
            delete it['election' + i];
            delete it['election' + i + 'Rank'];
          }
          it.electionExaminationSubjectEntityList = electionExaminationSubjectEntityList;
          it.gender = it.gender === '男';
        });
        Modal.confirm({
          title: '导入学生二次确认',
          content: '此操作将清除原有' + klass.name + '学生，原有课表等信息需要重新构建, 确定需要导入吗？',
          onOk: () => {
            console.log(payload);
            onOk(payload);
          }
        })
      }
      else {
        onCancel();
      }
    }
  };
}
