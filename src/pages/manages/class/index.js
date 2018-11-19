import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, DatePicker, Input, notification, Checkbox, Button} from 'antd';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {ManagesClass as namespace, ManagesGrade, ManagesStudent, ManagesTeacher} from '../../../utils/namespace';
import styles from './index.less';
import {ClassTypeEnum, Enums} from '../../../utils/Enum';

@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
}))
export default class MeterList extends Component {

  state = {};

  render() {
    const {list, total, loading, location, dispatch, gradeList = []} = this.props;

    const {pathname, query} = location;

    const title = '班级列表';

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
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {
        title: '年级', key: 'gradeId', render: (v, row) => row.gradeId,
        filters: gradeList.map(it => ({value: it.id, text: it.name})),
        filtered: !!query.gradeId,
        filterMultiple: false,
        filteredValue: query.gradeId ? [query.gradeId] : [],
      },
      {title: '班级名称', key: 'name',},
      {title: '类型', key: 'type', render: type => ClassTypeEnum[type] || '',
        filters: Enums(ClassTypeEnum).map(it => ({value: it.value, text: it.name})),
        filtered: !!query.type,
        filterMultiple: false,
        filteredValue: query.type ? [query.type] : [],
      },
      {title: '教师', key: 'teacherName',},
      {title: '备注', key: 'memo',},
      {
        title: '操作', key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              look: () => dispatch(routerRedux.push({pathname: ManagesStudent, query: {gradeId: id}})),
              edit: () => this.setState({visible: true, item: row}),
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
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
      </ListPage>
    );
  }
}


@connect(state => ({
  gradeList: state[ManagesGrade].list,
  teacherList: state[ManagesTeacher].list,
}))
@Form.create({
  mapPropsToFields(props) {
    const {name, type, gradeId, teacherId} = props.item || {};
    return {
      name: Form.createFormField({value: name || undefined}),
      type: Form.createFormField({value: type && type.toString() || undefined}),
      gradeId: Form.createFormField({value: gradeId || undefined}),
      teacherId: Form.createFormField({value: teacherId || undefined}),
    }
  }
})
class ClassModal extends Component {

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

  }

  render() {
    const {
      visible, onCancel, onOk, item, teacherList = [], gradeList = [],
      form: {getFieldDecorator, validateFieldsAndScroll}
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
          <Form.Item label="名称" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入班级名称', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="类型" {...wrapper}>
            {
              getFieldDecorator('type', {
                rules: [{message: '请选择班级类型', required: true}]
              })(
                <Select placeholder="请选择">
                  {
                    Enums(ClassTypeEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="教师" {...wrapper}>
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
        </Form>
      </Modal>
    )
  }
}
