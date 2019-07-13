import React, {Component} from 'react';
import {connect} from 'dva';
import {Form, Modal, Input, notification} from 'antd';
import {ManagesRoom, ManagesDevice as namespace,} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  roomList: state[ManagesRoom].list,
}))
export default class MeterList extends Component {

  state = {};

  render() {
    const {list, total, loading, location, dispatch} = this.props;

    const {pathname, query} = location;

    const title = '设备列表';

    const breadcrumb = ['管理', '设备管理', title];

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
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '设备名称', key: 'name', width: 220, },
      {title: '设备编号', key: 'device', width:'auto', tac:false},
      {
        title: '操作', width:120,
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

    const deviceModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '设备成功'});
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
        <DeviceModal {...deviceModalProps} />
      </ListPage>
    );
  }
}


@Form.create({
  mapPropsToFields(props) {
    const {name, device} = props.item || {};
    return {
      name: Form.createFormField({value: name || undefined}),
      device: Form.createFormField({value: device || undefined}),
    }
  }
})
class DeviceModal extends Component {

  render() {
    const {
      visible, onCancel, onOk, item,
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改设备' : '创建设备',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
            // console.log(payload);
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
          <Form.Item label="设备名称" {...wrapper}>
            {
              getFieldDecorator('name', {rules: [{message: '请输入设备名称', required: true}]})(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="设备编号" {...wrapper}>
            {
              getFieldDecorator('device', {rules: [{message: '请输入设备编号', required: true}]})(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
