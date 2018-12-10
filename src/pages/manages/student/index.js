import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Modal, Input, notification, Radio, Button, Select} from 'antd';
import {ManagesClass, ManagesGrade, ManagesStudent as namespace, ManagesSubject} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import styles from './index.less';
import ExcelImportModal from '../../../components/ExcelImport';
import ReadExcel from '../../../components/ReadExcel';
import {ClassTypeEnum} from "../../../utils/Enum";

@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  classList: state[ManagesClass].list,
}))
export default class StudentList extends Component {

  state = {};

  componentDidMount() {
    this.fetchGradeList();
    this.fetchClassList();
  }

  fetchGradeList() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list',
      payload: {s: 1000}
    });
  }

  fetchClassList() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesClass + '/list',
      payload: {s: 1000}
    });
  }

  render() {
    const {
      list, total, loading,
      gradeList = [], classList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const classMap = classList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const grade = gradeMap[query.gradeId] || {};
    const klass = classMap[query.klassId] || {};

    const title = (klass.name || grade.name || '') + (query.gender === 'true' ? '男' : query.gender === 'false' ? '女' : '') + '学生列表';

    const breadcrumb = ['管理', '学生管理', title];


    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          this.setState({visible: true, item: null});
        },
      },
    ];

    if (query.klassId && klass && klass.type === ClassTypeEnum.行政班) {

      buttons.push(
        {
          key: 'import',
          type: 'primary',
          children: '导入' + (klass.name || '') + '学生',
          title: '导入',
          icon: 'import',
          onClick: () => {
            this.setState({importModalVisible: true});
          },
        }
      )
    }

    let filterClassList = classList;
    if (query.gradeId) {
      filterClassList = classList.filter(it => it.gradeId === query.gradeId * 1);
    }

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '学号', key: 'code'},
      {title: '姓名', key: 'name'},
      {
        title: '年级', key: 'gradeId',
        filters: gradeList.map(it => ({value: it.id, text: it.name})),
        filtered: !!query.gradeId,
        filterMultiple: false,
        filteredValue: query.gradeId ? [query.gradeId] : [],
        render: (gradeId, row) => row.gradeName
      },
      {
        title: '班级', key: 'klassId',
        filters: filterClassList.map(it => ({value: it.id, text: it.name})),
        filtered: !!query.klassId,
        filterMultiple: false,
        filteredValue: query.klassId ? [query.klassId] : [],
        render: (classId, row) => row.klassName,
      },
      {
        title: '性别', key: 'gender', render: v => v ? '男' : '女',
        filters: [{value: true, text: '男'}, {value: false, text: '女'}],
        filtered: !!query.gender,
        filterMultiple: false,
        filteredValue: query.gender ? [query.gender] : [],
      },
      {
        title: '选考科目', key: 'electionExaminationCourseEntityList', width: 100,
        render: list => list ? list.map(it => <span className={styles['separate']} key={it.id}>{it.name}</span>) : ''
      },
      {
        title: '学考科目', key: 'studyExaminationCourseEntityList', width: 100,
        render: list => list ? list.map(it => <span className={styles['separate']} key={it.id}>{it.name}</span>) : ''
      },
      {
        title: '操作',
        key: 'operate',
        // width: 100,
        render: (id, item) => (
          <TableCellOperation
            operations={{
              edit: () => {
                this.setState({visible: true, item});
              },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
              // timetable: {
              //   children: '课表',
              //   onClick: () => {
              //     dispatch(routerRedux.push({
              //       pathname: TimetableStudent,
              //       query: {studentId: id, gradeId: item.gradeId, name: item.name}
              //     }))
              //   }
              // }
            }}
          />
        ),
      },
    ];

    const studentModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '学生成功'});
            this.setState({visible: false});
          }
        })
      }
    };

    const importModalProps = {
      title: '导入' + (klass.name || '') + '学生',
      visible: this.state.importModalVisible,
      onCancel: () => this.setState({importModalVisible: false}),
      onOk: (payload) => {
        Modal.confirm({
          title: '导入学生二次确认',
          content: '此操作将清除原有' + klass.name + '学生，原有课表等信息需要重新构建, 确定需要导入吗？',
          onOk: () => {
            payload.klassId = query.klassId;
            dispatch({
              type: namespace + '/excelImport',
              payload,
              resolve: ({list, total}) => {
                notification.success({
                  message: '导入' + (klass.name || '') + '学生，共计' + total + '条记录'
                });
                this.setState({importModalVisible: false});
              }
            })
          }
        })
      }
    };


    return (
      <ListPage
        operations={buttons}
        location={location}
        loading={!!loading}
        columns={columns}
        breadcrumb={breadcrumb}
        list={list}
        total={total}
        pagination
        title={title}
        scrollHeight={162}
        onChange={(pagination, filters) => {
          if (filters.klassId[0] && filters.gradeId && filters.gradeId.length) {
            const klass = classList.find(it => it.id * 1 === filters.klassId[0] * 1);
            if (klass && klass.gradeId && klass.gradeId !== filters.gradeId[0] * 1) {
              return {klassId: undefined};
            }
          }
          return {};
        }}
      >
        <StudentModal {...studentModalProps} />
        <ImportStudentModal {...importModalProps} />
      </ListPage>
    )
  }
}


@Form.create({
  mapPropsToFields(props) {
    const {name, code, gender} = props.item || {};
    return {
      name: Form.createFormField({value: name || undefined}),
      code: Form.createFormField({value: code || undefined}),
      gender: Form.createFormField({value: gender || false}),
    }
  }
})
class StudentModal extends Component {

  componentDidMount() {
  }

  render() {
    const {
      visible, onCancel, onOk, item,
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改学生' : '创建学生',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
            console.log(payload);
            onOk(payload);
          }
        })
      }
    };
    const wrapper = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    };
    return (
      <Modal {...modalProps}>
        <Form layout="horizontal">
          <Form.Item label="学号" {...wrapper}>
            {
              getFieldDecorator('code', {
                rules: [{message: '请输入学号', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="姓名" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入姓名', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="性别" {...wrapper}>
            {
              getFieldDecorator('gender', {
                rules: [{message: '请选择性别', required: true}]
              })(
                <Radio.Group placeholder="请选择">
                  <Radio value={true}>男</Radio>
                  <Radio value={false}>女</Radio>
                </Radio.Group>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}


@connect(state => ({
  subjectNameMap: ((list = []) => {
    return list.reduce((map, it) => {
      map[it.name] = it;
      return map;
    }, {});
  })(state[ManagesSubject].list),
}))
class ImportStudentModal extends Component {

  state = {};

  componentDidMount() {
    this.props.dispatch({
      type: ManagesSubject + '/list',
      payload: {s: 10000}
    })
  }

  render() {
    let {
      title, visible, onCancel, onOk, subjectNameMap = {},
    } = this.props;

    const fields = {
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
          validator(rule, value, callback, source, options){
            const errors = [];
            if(source['选考2'] && source['选考1'] === source['选考2']){
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
        },{
          validator(rule, value, callback, source, options){
            const errors = [];
            if(source['选考3']) {
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
                  }else{
                    if(sn[it]){
                      errors.push(new Error(`${it}学考科目已经存在`));
                    }else {
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
    };

    const modalProps = {
      width: 1000,
      visible,
      title,
      onCancel,
      destroyOnClose: true,
      className: styles['import-student-modal'],
      onOk: () => {
        let {errors, list} = ReadExcel.transform(this.state.data, fields);
        if (errors) {
          Modal.error({title: `数据还有${errors.length}处错误`, content: '请修改Excel文件内的错误内容后再导入'});
        } else {
          list.forEach(it => {
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
                    election.rank = parseInt(it['election' + i + 'Rank']);
                  }
                  electionExaminationSubjectEntityList.push(election);
                }
              }
              delete it['election' + i];
              delete it['election' + i + 'Rank'];
            }
            it.electionExaminationSubjectEntityList = electionExaminationSubjectEntityList;
          });
          onOk({studentImportList: JSON.stringify(list)});
        }
      },
      footer: (
        <div>
          {
            this.state.data ?
              <Button onClick={() => this.setState({data: null})}>重新上传</Button>
              :
              null
          }
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={() => modalProps.onOk()}>确定</Button>
        </div>
      )
    };
    const wrapper = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    };


    return (
      <Modal {...modalProps}>
        <ReadExcel fields={fields} {...this.state} onChange={(state) => this.setState(state)}/>
      </Modal>
    )
  }
}
