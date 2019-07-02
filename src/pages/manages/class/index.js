import React, {Component} from 'react';
import {connect} from 'dva';
import router from 'umi/router';
import {Form,  Modal, Select,  Input, notification} from 'antd';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {
  ManagesClass as namespace,
  ManagesGrade, ManagesRoom,
  ManagesStudent,
  ManagesSubject,
  ManagesTeacher
} from '../../../utils/namespace';
import styles from './index.less';
import {ClassTypeEnum, Enums} from '../../../utils/Enum';
import ExcelImportModal, {buildImportStudentProps} from '../../../components/ExcelImportModal';

@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  subjectList: state[ManagesSubject].list,
}))
export default class MeterList extends Component {

  state = {};

  componentDidMount() {
    this.fetchSubjectList();
  }

  fetchSubjectList() {
    this.props.dispatch({
      type: ManagesSubject + '/list',
      payload: {s: 10000}
    })
  }

  render() {
    const {list, total, loading, location, dispatch, gradeList = [], subjectList = []} = this.props;

    const {pathname, query} = location;
    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const grade = gradeMap[query.gradeId] || {};

    const title = (grade.name && (grade.name + '（' + grade.schoolYear + '级）') || '') + '班级列表';

    const breadcrumb = ['管理', '班级管理', title];

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
      // {
      //   key: 'import',
      //   type: 'primary',
      //   children: '导入',
      //   title: '导入',
      //   icon: 'import',
      //   onClick: () => {
      //     this.setState({importModalVisible: true});
      //   },
      // },
      {
        key:'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {
        title: '年级', key: 'gradeId', width: 70,
        render: (v, row) => row.gradeName + '（' + (gradeMap[row.gradeId] && gradeMap[row.gradeId].schoolYear || '') + '级）',
        filters: gradeList.map(it => ({value: it.id, text: it.name + '（' + it.schoolYear + '级' + '）'})),
        filtered: !!query.gradeId,
        filterMultiple: false,
        filteredValue: query.gradeId ? [query.gradeId] : [],
      },
      {title: '班级名称', key: 'name',},
      {
        title: '类型', key: 'type', render: type => ClassTypeEnum[type] || '',
        filters: Enums(ClassTypeEnum).map(it => ({value: it.value, text: it.name})),
        filtered: !!query.type,
        filterMultiple: false,
        filteredValue: query.type ? [query.type] : [],
      },
      {title: '科目', key: 'subjectName',},
      {title: '班主任', key: 'teacherName',},
      {title: '教室', key: 'roomName'},
      {
        title: '操作', key: 'operate', width: 100, tac: false,
        render: (id, row) => (
          <TableCellOperation
            operations={{
              look: () => router.push({pathname: ManagesStudent, query: {klassId: id.toString()}}),
              edit: () => this.setState({visible: true, item: row}),
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
              'import': row.type === ClassTypeEnum.行政班 ? {
                children: '导入学生',
                onClick: () => {
                  this.setState({importStudentModalVisible: true, item: row});
                }
              } : null,
            }}
          />
        ),
      },
    ];

    const classModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '班级成功'});
            this.setState({visible: false});
          }
        })
      }
    };

    // const importModalProps = {
    //   title: '导入班级',
    //   visible: this.state.importModalVisible,
    //   onCancel: () => this.setState({importModalVisible: false}),
    //   templateUrl: 'https://res.yunzhiyuan100.com/hii/班级管理录入模板（请勿随意更改模板格式，否则无法导入数据！）.xlsx',
    //   excelImport: (excelUrl) => {
    //     return new Promise((resolve, reject) => {
    //       dispatch({
    //         type: namespace + '/excelImport',
    //         payload: {
    //           excelUrl
    //         },
    //         resolve, reject
    //       });
    //     })
    //   }
    // };

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
      >
        <ClassModal {...classModalProps} />
        {
          this.state.importStudentModalVisible && this.state.item ?
            <ExcelImportModal {...buildImportStudentProps({
              klass: this.state.item,
              visible: true,
              onCancel: () => this.setState({importStudentModalVisible: false}),
              dispatch, subjectList
            })} />
            :
            null
        }

        {/*<ExcelImportModal {...importModalProps} />*/}
      </ListPage>
    );
  }
}


@connect(state => ({
  gradeList: state[ManagesGrade].list,
  teacherList: state[ManagesTeacher].list,
  subjectList: state[ManagesSubject].list,
  roomList: state[ManagesRoom].list
}))
@Form.create({
  mapPropsToFields(props) {
    const {name, type, gradeId, teacherId, subjectId, roomId} = props.item || {};
    return {
      name: Form.createFormField({value: name || undefined}),
      type: Form.createFormField({value: type && type.toString() || undefined}),
      gradeId: Form.createFormField({value: gradeId || undefined}),
      teacherId: Form.createFormField({value: teacherId || undefined}),
      subjectId: Form.createFormField({value: subjectId || undefined}),
      roomId: Form.createFormField({value: roomId || undefined}),
    }
  }
})
class ClassModal extends Component {

  state = {};

  componentDidMount() {
    if (!this.props.gradeList) {
      this.props.dispatch({
        type: ManagesGrade + '/list',
        payload: {s: 10000}
      })
    }
    if (!this.props.teacherList) {
      this.props.dispatch({
        type: ManagesTeacher + '/list',
        payload: {s: 10000}
      })
    }
    if (!this.props.subjectList) {
      this.props.dispatch({
        type: ManagesSubject + '/list',
        payload: {s: 10000}
      })
    }
    if (!this.props.roomList) {
      this.props.dispatch({
        type: ManagesRoom + '/list',
        payload: {s: 10000}
      })
    }

  }

  render() {
    const {
      visible, onCancel, onOk, item, teacherList = [], gradeList = [], subjectList = [], roomList = [],
      form: {getFieldDecorator, validateFieldsAndScroll, setFields, getFieldValue}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改班级' : '创建班级',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if ((payload.type * 1 === ClassTypeEnum.选考班 * 1 || payload.type * 1 === ClassTypeEnum.学考班 * 1) && !payload.subjectId) {
              console.log('学考与选考时必须选择教师');
              setFields({subjectId: {errors: [new Error('学考与选考时必须选择教师')]}})
            } else {
              if (item && item.id) {
                payload.id = item.id;
              }
              onOk(payload);
            }
          }
        })
      }
    };
    const wrapper = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    };

    const type = (this.state.type || (this.props.item && this.props.item.type)) * 1;

    return (
      <Modal {...modalProps}>
        <Form layout="horizontal">
          <Form.Item label="年级" {...wrapper}>
            {
              getFieldDecorator('gradeId', {
                rules: [{message: '请选择年级', required: true}]
              })(
                <Select placeholder="请选择">
                  {
                    gradeList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="类型" {...wrapper}>
            {
              getFieldDecorator('type', {
                rules: [{message: '请选择班级类型', required: true}]
              })(
                <Select placeholder="请选择" onChange={(type) => {
                  this.setState({type})
                }}>
                  {
                    Enums(ClassTypeEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          {
            type === ClassTypeEnum.学考班 * 1 || type === ClassTypeEnum.选考班 * 1 ?
              <Form.Item label="科目" {...wrapper} help="选考与学考必选">
                {
                  getFieldDecorator('subjectId', {
                    rules: [
                      {
                        required: true,
                        message: '学考与选考时必须选择教师'
                      }
                    ]
                  })(
                    <Select placeholder="请选择" onChange={subjectId => {
                      if (!getFieldValue('name')) {
                        const subject = subjectList.find(it => it.id * 1 === subjectId * 1);
                        if (subject) {
                          setFields({name: {value: subject.name, errors: null}});
                        }
                      }
                    }}>
                      {
                        subjectList.map(it =>
                          <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                        )
                      }
                    </Select>
                  )
                }
              </Form.Item>
              :
              type * 1 === ClassTypeEnum.行政班 ?
                <Form.Item label="班主任" {...wrapper}>
                  {
                    getFieldDecorator('teacherId', {})(
                      <Select placeholder="请选择">
                        {
                          teacherList.map(it =>
                            <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                          )
                        }
                      </Select>
                    )
                  }
                </Form.Item>
                :
                null
          }
          <Form.Item label="名称" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入班级名称', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="教室" {...wrapper}>
            {
              getFieldDecorator('roomId', {})(
                <Select placeholder="请选择">
                  {
                    roomList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
