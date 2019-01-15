import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, Input, notification, Cascader, Spin} from 'antd';
import {ManagesBed, ManagesBuilding, ManagesDevice, ManagesDormitory as namespace} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {BuildingTypeEnum, Enums} from "../../../utils/Enum";
import router from 'umi/router';

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
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '楼宇', key: 'buildingName'},
      {title: '楼层', key: 'layerName'},
      {title: '编号', key: 'code'},
      {title: '寝室', key: 'name'},
      {title: '床位数', key: 'bedCount'},
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
              look: () => router.push({pathname: ManagesBed, query: {dormitoryId: id, name: row.name, }})
            }}
          />
        ),
      },
    ];

    const roomModalProps = {
      loading: !!loading,
      visible: this.state.visible,
      item: this.state.item,
      buildingList,
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
    const {buildingList = []} = props;
    const {code, name, type, layerId, bedCount} = props.item || {};

    let buildingId;

    for (let i = 0; i < buildingList.length; i++) {
      const layerList = buildingList[i].layerList;
      for (let j = 0; j < layerList.length; j++) {
        if (layerList[j].id === layerId) {
          buildingId = buildingList[i].id;
        }
      }
    }

    return {
      code: Form.createFormField({value: code || undefined}),
      name: Form.createFormField({value: name || undefined}),
      type: Form.createFormField({value: type && type.toString() || undefined}),
      layerId: Form.createFormField({value: (buildingId && layerId) ? [buildingId, layerId] : undefined}),
      bedCount: Form.createFormField({value: bedCount || undefined}),
    }
  }
})
class DormitoryModal extends Component {

  render() {
    const {
      visible, onCancel, onOk, item, buildingList = [], loading,
      form: {getFieldDecorator, validateFieldsAndScroll, getFieldValue}
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
            payload.layerId = payload.layerId[1];
            console.log(payload);
            onOk(payload);
          }
        })
      },
      okButtonProps: {
        loading,
      }
    };
    const wrapper = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    };

    const buildings = buildingList.map(it => {
      const {id, name, layerList = []} = it;
      return {
        label: name, value: id,
        children: layerList.map(layer => {
          const {id, name} = layer;
          return {label: name, value: id};
        })
      }
    });

    return (
      <Modal {...modalProps}>
        <Spin spinning={loading}>
          <Form layout="horizontal">
            <Form.Item label="楼层" {...wrapper}>
              {
                getFieldDecorator('layerId', {
                  rules: [{message: '请选择楼层', required: true}]
                })(
                  <Cascader placeholder="请选择楼层" options={buildings} onChange={value => {
                    if (value && value[0] && value[1]) {
                      const code = getFieldValue('code');
                      if (code) {
                        this.autoName(value[0], value[1], code);
                      }
                    }
                  }}/>
                )
              }
            </Form.Item>
            <Form.Item label="寝室编号" {...wrapper}>
              {
                getFieldDecorator('code', {
                  rules: [{message: '请输入寝室编号', required: true}]
                })(
                  <Input placeholder="请输入编号，例如:102" maxLength={64} onChange={e => {
                    const {value} = e.target;
                    if (value) {
                      const layerId = getFieldValue('layerId');
                      if (layerId && layerId[0] && layerId[1]) {
                        this.autoName(layerId[0], layerId[1], value);
                      }
                    }
                  }}/>
                )
              }
            </Form.Item>
            <Form.Item label="寝室名" {...wrapper}>
              {
                getFieldDecorator('name', {
                  rules: [{message: '请输入寝室名', required: true}]
                })(
                  <Input maxLength={64}/>
                )
              }
            </Form.Item>
            <Form.Item label="床位数" {...wrapper}>
              {
                getFieldDecorator('bedCount', {
                  rules: [{message: '请输入床位数', required: true}]
                })(
                  <Input maxLength={64}/>
                )
              }
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    )
  }

  autoName = (buildingId, layerId, code) => {
    const {form: {setFieldsValue}, buildingList = []} = this.props;
    if (buildingId && code) {
      const building = buildingList.find(it => it.id === buildingId);
      if (building) {
        const layer = building.layerList.find(it => it.id === layerId);
        const name = building.name + layer.name + code;
        setFieldsValue({name});
      }
    }

  }
}
