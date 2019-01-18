import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Cascader, Row, Col, message, Modal, Select, Input, notification, Spin} from 'antd';
import {
  ManagesClassroom as namespace,
  ManagesPew, ManagesBuilding
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {BuildingTypeEnum} from "../../../utils/Enum";
import router from 'umi/router';


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  buildingList: state[ManagesBuilding].list,
}))
export default class ClassroomList extends Component {

  state = {};

  componentDidMount() {
    // this.props.dispatch({
    //   type: ManagesDevice + '/list',
    //   payload: {
    //     s: 10000
    //   }
    // });
    this.props.dispatch({
      type: ManagesBuilding + '/list',
      payload: {
        type: BuildingTypeEnum.教学区
      }
    });
  }

  render() {
    const {list, total, loading, location, dispatch, buildingList = []} = this.props;

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
      {
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '楼层', key: 'buildingName', render: (v, it) => v + it.layerName},
      {title: '教室', key: 'name',},
      {title: '座位(行x列)', key: 'rowTotal', render: (v, it) => `${v || 0}x${it.columnTotal || 0}`},
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
              look: () => router.push({
                pathname: ManagesPew,
                query: {
                  classroomId: id,
                  name: row.buildingName + row.layerName + row.name,
                  rowTotal: row.rowTotal,
                  columnTotal: row.columnTotal
                }
              })
            }}
          />
        ),
      },
    ];

    const classroomModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      loading,
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
      },

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
        <ClassroomModal {...classroomModalProps} />
      </ListPage>
    );
  }
}


@Form.create({
  mapPropsToFields(props) {
    const {code, name, rowTotal, columnTotal, layerId} = props.item || {};
    const {buildingList = []} = props;

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
      layerId: Form.createFormField({value: (buildingId && layerId) ? [buildingId, layerId] : undefined}),
      rowTotal: Form.createFormField({value: rowTotal || undefined}),
      columnTotal: Form.createFormField({value: columnTotal || undefined}),
      // type: Form.createFormField({value: type && type.toString() || undefined}),
      // layerTotal: Form.createFormField({value: layerTotal || undefined}),
    }
  }
})
class ClassroomModal extends Component {

  render() {
    const {
      visible, onCancel, onOk, item, buildingList = [], loading,
      form: {getFieldDecorator, validateFieldsAndScroll, getFieldValue}
    } = this.props;

    const buildings = buildingList.map(it => {
      const {id, name, layerList} = it;
      return {
        value: id, label: name, children: layerList.map(({id, name}) => ({value: id, label: name}))
      };
    });

    const modalProps = {
      visible,
      title: item && item.id ? '修改教室' : '创建教室',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            payload.layerId = payload.layerId[1];
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
        <Spin spinning={!!loading}>
          <Form layout="horizontal">
            <Form.Item label="楼层名" {...wrapper}>
              {
                getFieldDecorator('layerId', {
                  rules: [{message: '请选择楼层', required: true}]
                })(
                  <Cascader placeholder="请选择楼层" options={buildings} onChange={value => {
                    // if (value && value[0] && value[1]) {
                    //   const code = getFieldValue('code');
                    //   if (code) {
                    //     this.autoName(value[0], value[1], code);
                    //   }
                    // }
                  }}/>
                )
              }
            </Form.Item>
            <Form.Item label="编号" {...wrapper}>
              {
                getFieldDecorator('code', {
                  rules: [{message: '请输入编号', required: true}]
                })(
                  <Input placeholder="请输入编号" maxLength={64} onChange={(e) => {
                    // const {value} = e.target;
                    //
                    // const layerId = getFieldValue('layerId');
                    // if (layerId && layerId[0] && layerId[1]) {
                    //   this.autoName(layerId[0], layerId[1], value);
                    // }

                  }}/>
                )
              }
            </Form.Item>
            <Form.Item label="名称" {...wrapper}>
              {
                getFieldDecorator('name', {
                  rules: [{message: '请输入名称', required: true}]
                })(
                  <Input placeholder="请输入名称" maxLength={64}/>
                )
              }
            </Form.Item>
            <Form.Item label="座位行数" {...wrapper}>
              {
                getFieldDecorator('rowTotal', {
                  rules: [{message: '请输入座位行数', required: true}]
                })(
                  <Input placeholder="请输入座位行数" maxLength={64}/>
                )
              }
            </Form.Item>
            <Form.Item label="座位列数" {...wrapper}>
              {
                getFieldDecorator('columnTotal', {
                  rules: [{message: '请输入座位列数', required: true}]
                })(
                  <Input placeholder="请输入座位列数" maxLength={64}/>
                )
              }
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    )
  }

  // autoName = (buildingId, layerId, code) => {
  //   const {form: {setFieldsValue}, buildingList = []} = this.props;
  //   if (buildingId && layerId && code) {
  //     const building = buildingList.find(it => it.id === buildingId);
  //     if (building) {
  //       const layer = building.layerList.find(it => it.id === layerId);
  //       const name = building.name + layer.name + code;
  //       setFieldsValue({name});
  //     }
  //   } else {
  //     setFieldsValue({name: ''});
  //   }
  // }
}
