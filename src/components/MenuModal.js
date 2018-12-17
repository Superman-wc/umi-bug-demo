import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Modal, Form, Input, Select, Spin} from 'antd';
import {connect} from 'dva';
import {Enums, URLResourceCategoryEnum, EnableStatusEnum} from '../utils/Enum';
import {AdminMenu as namespace, AdminUrlResource} from '../utils/namespace';

const MenuCategoryEnum ={
  '管理':'manages',
  '排课':'timetable'
}

@Form.create({
  mapPropsToFields: props => {
    return {
      category: Form.createFormField({value: props.item && props.item.category || undefined}),
      controllerName: Form.createFormField({value: props.item && props.item.controllerName || undefined}),
      menuGroup: Form.createFormField({value: props.item && props.item.menuGroup || undefined}),
      title: Form.createFormField({value: props.item && props.item.title || undefined}),
      link: Form.createFormField({value: props.item && props.item.link || undefined}),
    }
  }
})
@connect(state => ({
  allMenu: state[namespace].all,
  allUrlResource: state[AdminUrlResource].all,
  loading: state[namespace].loading || state[AdminUrlResource].loading,
}))
export default class MenuModal extends Component {
  static propTypes = {
    onOk: PropTypes.func,
    item: PropTypes.object,
    onCancel: PropTypes.func,
    visible: PropTypes.bool,
    controllers: PropTypes.array,
  };

  render() {

    const {
      allMenu, allUrlResource, loading, appId,
      onOk, onCancel, item = {}, visible,
      form: {getFieldDecorator, validateFieldsAndScroll, setFieldsValue, getFieldValue},
    } = this.props;


    const menuMap = allMenu && allMenu.reduce((m, it) => {
      m[it.controllerName] = it;
      return m;
    }, {}) || {};

    const URLResourceCategoryMap = {};

    const urs = allUrlResource && allUrlResource.reduce((arr, it) => {
      if (!menuMap[it.controllerName]) {
        arr.push(it)
      }
      const category = it.category.trim();
      const categories = URLResourceCategoryMap[category] || [];
      categories.push(it);
      URLResourceCategoryMap[category] = categories;
      return arr;
    }, []) || [];

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 14},
    };




    return (
      <Modal title={"创建菜单"} visible={visible} confirmLoading={!!loading}
             onCancel={onCancel}
             onOk={() => {
               validateFieldsAndScroll((errors, payload) => {
                 if (errors) {
                   console.log(errors)
                 } else {
                   if (item && item.id) {
                     payload.id = item.id;
                   }
                   payload.appId = appId
                   payload.link = payload.link.replace(/[A-Z]/g, function (a) {
                     return '-' + a.toLowerCase()
                   });
                   onOk(payload);
                 }
               });
             }}
      >
        <Spin spinning={!!loading}>
          <Form layout="horizontal">
            <Form.Item label="类别" {...formItemLayout} hasFeedback>
              {
                getFieldDecorator('category', {
                  initialValue: item ? item.category : undefined,
                  rules: [{required: true, message: '请选择类别'}]
                })(
                  <Select placeholder="请选择类别" onChange={v => {
                    console.log(v);
                    let cn = getFieldValue('controllerName');
                    if (cn) {
                      const link = `/${MenuCategoryEnum[v]}/${cn.substr(0, 1).toLowerCase()}${cn.substr(1, cn.length).replace(/[A-Z]/g, a => '-' + a.toLowerCase())}`;
                      setFieldsValue({link});
                    }
                  }}>
                    {
                      Object.keys(URLResourceCategoryMap).reduce((arr, it) => {
                        // if (it.value * 1 !== 0) {
                        arr.push(<Select.Option key={it} value={it}>{it}</Select.Option>)
                        // }
                        return arr
                      }, [])
                    }
                  </Select>
                )
              }
            </Form.Item>
            <Form.Item label="模块" {...formItemLayout} hasFeedback>
              {
                getFieldDecorator('controllerName', {
                  initialValue: item ? item.controllerName : undefined,
                  rules: [{required: true, message: '请选择模块'}]
                })(
                  <Select placeholder="请选择模块" onChange={v => {
                    const ca = getFieldValue('category');
                    if (ca) {
                      console.log(ca, MenuCategoryEnum[ca]);
                      const link = `/${MenuCategoryEnum[ca]}/${v.substr(0, 1).toLowerCase()}${v.substr(1, v.length).replace(/[A-Z]/g, a => '-' + a.toLowerCase())}`;
                      setFieldsValue({link});
                    }

                  }}>
                    {
                      urs.map(it =>
                        <Select.Option key={it.id}
                                       value={it.controllerName + ''}>{it.description || it.controllerName}</Select.Option>
                      )
                    }
                  </Select>
                )
              }
            </Form.Item>
            <Form.Item label="分组" {...formItemLayout} hasFeedback>
              {
                getFieldDecorator('menuGroup', {
                  initialValue: item ? item.menuGroup : undefined,
                  rules: [{required: true, message: '请输入分组'}]
                })(
                  <Input placeholder="请输入分组"/>
                )
              }
            </Form.Item>
            <Form.Item label="名称" {...formItemLayout} hasFeedback>
              {
                getFieldDecorator('title', {
                  initialValue: item ? item.title : undefined,
                  rules: [{required: true, message: '请输入名称'}]
                })(
                  <Input placeholder="请输入名称"/>
                )
              }
            </Form.Item>
            <Form.Item label="菜单路径" {...formItemLayout} hasFeedback>
              {
                getFieldDecorator('link', {
                  initialValue: item ? item.link : undefined,
                })(
                  <Input placeholder="请输入菜单路径" readOnly/>
                )
              }
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
