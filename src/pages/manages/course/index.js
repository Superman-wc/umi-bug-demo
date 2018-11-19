import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, DatePicker, Input, notification, Checkbox, Button, Radio} from 'antd';
import {
  ManagesClass,
  ManagesCourse as namespace,
  ManagesGrade,
  ManagesSubject,
  ManagesTeacher
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import GradeClassSelector from '../../../components/GradeClassSelector';
import {CourseTypeEnum, Enums} from "../../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  subjectList: state[ManagesSubject].list,
}))
export default class CourseUniqueList extends Component {

  state = {};

  componentDidMount() {
    if (!this.props.gradeList) {
      this.props.dispatch({
        type: ManagesGrade + '/list',
        payload: {s: 10000}
      })
    }
    if (!this.props.subjectList) {
      this.props.dispatch({
        type: ManagesSubject + '/list',
        payload: {s: 10000}
      })
    }

  }

  render() {
    const {
      list, total, loading,
      gradeList = [], subjectList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '课程列表';

    const breadcrumb = ['管理', '课程管理', title];

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
      {
        title: '年级', key: 'gradeId', render: (v, row) => row.gradeName,
        filters: gradeList.map(it => ({value: it.id, text: it.name})),
        filtered: !!query.gradeId,
        filterMultiple: false,
        filteredValue: query.gradeId ? [query.gradeId] : [],
      },
      {
        title: '科目', key: 'subjectId', render: (v, row) => row.subjectName,
        filters: subjectList.map(it => ({value: it.id, text: it.name})),
        filtered: !!query.subjectId,
        filterMultiple: false,
        filteredValue: query.subjectId ? [query.subjectId] : [],
      },
      {title: '名称', key: 'name'},
      {
        title: '行政班', key: 'belongToExecutiveClass', render: v => v ? '是' : '',
        filters: [{value: true, text: '是'}, {value: false, text: '否'}],
        filtered: !!query.belongToExecutiveClass,
        filterMultiple: false,
        filteredValue: query.belongToExecutiveClass ? [query.belongToExecutiveClass] : [],
      },
      {
        title: '分层', key: 'hierarchy', render: v => v ? '是' : '',
        filters: [{value: true, text: '是'}, {value: false, text: '否'}],
        filtered: !!query.hierarchy,
        filterMultiple: false,
        filteredValue: query.hierarchy ? [query.hierarchy] : [],
      },
      {
        title: '操作',
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              edit: () => this.setState({visible: true, item: row}),
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
      },
    ];

    const courseModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '课程成功'});
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
      >
        <CourseModal {...courseModalProps} />
      </ListPage>
    );
  }
}


@connect(state => ({
  gradeList: state[ManagesGrade].list,
  subjectList: state[ManagesSubject].list,
}))
@Form.create({
  mapPropsToFields(props) {
    const {name, type, gradeId, belongToExecutiveClass, hierarchy, memo, subjectId} = props.item || {};
    return {
      gradeId: Form.createFormField({value: gradeId || undefined}),
      subjectId: Form.createFormField({value: subjectId || undefined}),
      name: Form.createFormField({value: name || undefined}),
      type: Form.createFormField({value: type && type.toString() || undefined}),
      belongToExecutiveClass: Form.createFormField({value: belongToExecutiveClass || false}),
      hierarchy: Form.createFormField({value: hierarchy || false}),
      memo: Form.createFormField({value: memo || undefined}),

    }
  }
})
class CourseModal extends Component {

  componentDidMount() {
    if (!this.props.gradeList) {
      this.props.dispatch({
        type: ManagesGrade + '/list',
        payload: {s: 10000}
      })
    }
    if (!this.props.subjectList) {
      this.props.dispatch({
        type: ManagesSubject + '/list',
        payload: {s: 10000}
      })
    }

  }

  render() {
    const {
      visible, onCancel, onOk, item, subjectList = [], gradeList = [],
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改课程' : '创建课程',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
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
          <Form.Item label="科目" {...wrapper}>
            {
              getFieldDecorator('subjectId', {
                rules: [{message: '请选择科目', required: true}]
              })(
                <Select placeholder="请选择">
                  {
                    subjectList.map(it =>
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
                rules: [{message: '请选择课程类型', required: true}]
              })(
                <Select placeholder="请选择">
                  {
                    Enums(CourseTypeEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="行政班" {...wrapper}>
            {
              getFieldDecorator('belongToExecutiveClass', {
                rules: [{message: '请选择是否行政班', required: true}]
              })(
                <Radio.Group placeholder="请选择">
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              )
            }
          </Form.Item>
          <Form.Item label="分层" {...wrapper}>
            {
              getFieldDecorator('hierarchy', {
                rules: [{message: '请选择是否分层', required: true}]
              })(
                <Radio.Group placeholder="请选择">
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              )
            }
          </Form.Item>
          <Form.Item label="名称" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入课程名称', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="备注" {...wrapper}>
            {
              getFieldDecorator('memo')(
                <Input.TextArea maxLength={500} rows={5}/>
              )
            }
          </Form.Item>

        </Form>
      </Modal>
    )
  }
}
