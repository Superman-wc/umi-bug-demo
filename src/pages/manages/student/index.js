import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Modal, Input, notification, Radio, Button, Select} from 'antd';
import {ManagesClass, ManagesGrade, ManagesStudent as namespace} from '../../../utils/namespace';
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

    const title = (
      query.klassId && classMap[query.klassId] ?
        classMap[query.klassId].name
        :
        query.gradeId && gradeMap[query.gradeId] ?
          gradeMap[query.gradeId].name
          :
          ''
    ) + (query.gender === 'true' ? '男' : query.gender === 'false' ? '女' : '') + '学生列表';

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
      {
        key: 'import',
        type: 'primary',
        children: '导入',
        title: '导入',
        icon: 'import',
        onClick: () => {
          this.setState({importModalVisible: true});
        },
      },
    ];

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
      title: '导入学生',
      visible: this.state.importModalVisible,
      gradeList, classList,
      onCancel: () => this.setState({importModalVisible: false}),
      templateUrl: 'https://res.yunzhiyuan100.com/hii/学生名单录入模板（请勿随意更改模板格式，否则无法导入数据！）.xlsx',
      excelImport: ({excelUrl}) => {
        return new Promise((resolve, reject) => {
          dispatch({
            type: namespace + '/excelImport',
            payload: {
              excelUrl
            },
            resolve, reject
          });
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


@Form.create({})
class ImportStudentModal extends Component {

  state = {};

  render() {
    let {
      visible, onCancel, onOk, gradeList = [], classList = [],
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      width: 1000,
      visible,
      title: '导入学生',
      onCancel,
      destroyOnClose: true,
      className: styles['import-student-modal'],
      onOk: () => {

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
    classList = classList.filter(it => it.gradeId === this.state.gradeId && it.type === ClassTypeEnum.行政班);

    const fields = {
      '学号': {rules: [{required: true, message: '请输入学号'}, {pattern:/^\d{8}$/g, message:'请输入8位数字学号'}]},
      '姓名': {rules: [{required: true, message: '请输入姓名'}]},
    };


    return (
      <Modal {...modalProps}>
        <ReadExcel fields={fields} {...this.state} onChange={(state) => this.setState(state)}/>
        {
          this.state.data ?
            <Form layout="inline" style={{margin: '10px 20px'}}>
              <Form.Item label="年级" {...wrapper}>
                {
                  getFieldDecorator('gradeId', {
                    rules: [{message: '请选择年级', required: true}]
                  })(
                    <Select placehold="请选择年级" style={{width: 200}} onChange={(gradeId) => this.setState({gradeId})}>
                      {
                        gradeList.map(it =>
                          <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                        )
                      }
                    </Select>
                  )
                }
              </Form.Item>
              <Form.Item label="班级" {...wrapper}>
                {
                  getFieldDecorator('klassId', {
                    rules: [{message: '请选择班级', required: true}]
                  })(
                    <Select placehold="请选择班级" style={{width: 200}}>
                      {
                        classList.map(it =>
                          <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                        )
                      }
                    </Select>
                  )
                }
              </Form.Item>
            </Form>
            :
            null
        }
      </Modal>
    )
  }
}
