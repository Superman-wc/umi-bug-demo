import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, Input, notification} from 'antd';
import {ManagesClass, ManagesRoom as namespace, ManagesTeacher} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {ClassTypeEnum} from "../../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading
}))
export default class MeterList extends Component {

  state = {};

  render() {
    const {list, total, loading, location, dispatch} = this.props;

    const {pathname, query} = location;

    const title = '教室列表';

    const breadcrumb = ['管理', '教室管理', title];

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
      {title: '名称', key: 'name'},
      {title: '容纳学生数', key: 'capacity'},
      {title:'班级', key:'klassName'},
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

    const roomModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '教室成功'});
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
        <RoomModal {...roomModalProps} />
      </ListPage>
    );
  }
}

@connect(state => ({
  klassList: state[ManagesClass].list,
}))
@Form.create({
  mapPropsToFields(props) {
    const {klassId, name, capacity} = props.item || {};
    return {
      klassId: Form.createFormField({value: klassId || undefined}),
      name: Form.createFormField({value: name || undefined}),
      capacity: Form.createFormField({value: capacity || undefined}),
    }
  }
})
class RoomModal extends Component {

  componentDidMount() {
    if (!this.props.klassList) {
      this.props.dispatch({
        type: ManagesClass + '/list',
        payload: {s: 10000, type: ClassTypeEnum.行政班}
      })
    }
  }

  render() {
    const {
      visible, onCancel, onOk, item, klassList=[],
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改教室' : '创建教室',
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
          <Form.Item label="教室名" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入教室名', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="教室容量" {...wrapper}>
            {
              getFieldDecorator('capacity', {
                rules: [{message: '请输入教室容量', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="行政班级" {...wrapper}>
            {
              getFieldDecorator('klassId', {})(
                <Select placeholder="请选择">
                  {
                    klassList.map(it =>
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
