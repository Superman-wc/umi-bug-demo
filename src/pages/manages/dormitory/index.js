import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, Input, notification, Cascader} from 'antd';
import {ManagesBuilding, ManagesDevice, ManagesDormitory as namespace} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {BuildingTypeEnum, Enums} from "../../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  buildingList: state[ManagesBuilding].list,
}))
export default class MeterList extends Component {

  state = {};

  componentDidMount() {
    this.props.dispatch({
      type: ManagesBuilding + '/list',
      payload: {
        s: 10000,
        type: BuildingTypeEnum.生活区
      }
    });
  }

  render() {
    const {list, total, loading, location, dispatch, buildingList = []} = this.props;

    const {pathname, query} = location;

    const title = '寝室列表';

    const breadcrumb = ['管理', '寝室管理', title];

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
        key:'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title:'楼宇', key:'buildingName'},
      {title:'楼层', key:'layerName'},
      {title: '寝室', key: 'name'},
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
            notification.success({message: (payload.id ? '修改' : '创建') + '楼层成功'});
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
        <DormitoryModal {...roomModalProps} />
      </ListPage>
    );
  }
}


@Form.create({
  mapPropsToFields(props) {
    const {code, name, type, layerId} = props.item || {};
    return {
      // code: Form.createFormField({value: code || undefined}),
      name: Form.createFormField({value: name || undefined}),
      type: Form.createFormField({value: type && type.toString() || undefined}),
      layerId: Form.createFormField({value: layerId || undefined}),
    }
  }
})
class DormitoryModal extends Component {

  render() {
    const {
      visible, onCancel, onOk, item,
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改楼层' : '创建楼层',
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
          <Form.Item label="楼层名" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入楼层名', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="楼层" {...wrapper}>
            {
              getFieldDecorator('layerId', {
                // rules: [{message: '请输入编号', required: true}]
              })(
                <Cascader />
              )
            }
          </Form.Item>
          <Form.Item label="类型" {...wrapper}>
            {
              getFieldDecorator('type', {
                rules: [{message: '请输入选择类型', required: true}]
              })(
                <Select placeholder="请选择">
                  {
                    Enums(BuildingTypeEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="总楼层" {...wrapper}>
            {
              getFieldDecorator('layerTotal', {
                rules: [{message: '请输入总楼层', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
