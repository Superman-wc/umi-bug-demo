import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, DatePicker, Input, notification, Checkbox, Button, Radio} from 'antd';
import {
  ManagesClass,
  ManagesGrade,
  ManagesStudent as namespace, ManagesTeacher, TimetableStudent,
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import GradeClassSelector from "../../../components/GradeClassSelector";
import styles from './index.less';
import {GenderEnum, Enums} from "../../../utils/Enum";


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
    const {gradeList} = this.props;
    if (!gradeList) {
      this.fetchGradeList();
    }
  }

  fetchGradeList() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list',
    });
  }

  fetchClassList(payload) {
    const {dispatch, location: {pathname, query}} = this.props;
    dispatch(routerRedux.replace({pathname, query: {...query, ...payload}}));
    dispatch({
      type: ManagesClass + '/list',
      payload
    });
  }

  render() {
    const {
      list, total, loading,
      gradeList = [], classList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '学生列表';

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
      },
      {
        title: '班级', key: 'klassId',
        filters: classList.map(it => ({value: it.id, text: it.name})),
        filtered: !!query.klassId,
        filterMultiple: false,
        filteredValue: query.klassId ? [query.klassId] : [],
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
        width: 100,
        render: (id, item) => (
          <TableCellOperation
            operations={{
              edit: () => {
                this.setState({visible: true, item});
              },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
              timetable: {
                children: '课表',
                onClick: () => {
                  dispatch(routerRedux.push({
                    pathname: TimetableStudent,
                    query: {studentId: id, gradeId: item.gradeId, name: item.name}
                  }))
                }
              }
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
      >
        <StudentModal {...studentModalProps} />
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
