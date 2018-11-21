import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, Input ,notification} from 'antd';
import {
  ManagesClass,
  ManagesRoom,
  ManagesDevice as namespace,
  ManagesGrade,
  ManagesSubject
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {ClassTypeEnum, CourseTypeEnum, Enums} from "../../../utils/Enum";

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
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '设备名称', key: 'deviceName'},
      {title: '设备编号', key: 'device'},
      {title:'教室名称', key:'roomId'},
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

@connect(state => ({
  roomList: state[ManagesRoom].list,
}))
@Form.create({
  mapPropsToFields(props) {
    const {deviceName, device, roomId} = props.item || {};
    return {
      deviceName: Form.createFormField({value: deviceName || undefined}),
      device: Form.createFormField({value: device || undefined}),
      roomId: Form.createFormField({value: roomId || undefined}),
    }
  }
})
class DeviceModal extends Component {

  componentDidMount() {
    if (!this.props.roomList) {
      this.props.dispatch({
        type: ManagesRoom + '/list',
        payload: {s: 10000}
      })
    }
  }

  render() {
    const {
      visible, onCancel, onOk, item, roomList=[],
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
          <Form.Item label="设备名称" {...wrapper}>
            {
              getFieldDecorator('deviceName', {rules: [{message: '请输入设备名称', required: true}]})(
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
          <Form.Item label="教室名称" {...wrapper}>
            {
              getFieldDecorator('roomId', {rules: [{message: '请输入教室名称', required: true}]})(
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
