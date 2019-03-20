import React, {Component} from 'react';
import {connect} from 'dva';
import {Form, Modal, Input, notification, Select} from 'antd';
import {ManagesGrade as namespace, ManagesTimetable} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import router from 'umi/router';
import {GradeIndexEnum, Enums} from "../../../utils/Enum";


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

    const title = '年级列表';

    const breadcrumb = ['管理', '年级管理', title];

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
      {title: '名称', key: 'name'},
      {title: '入学年份', key: 'schoolYear'},
      {
        title: '操作',
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              timetable: {
                onClick: () => {
                  router.push({pathname: ManagesTimetable, query: {gradeIndex: row.gradeIndex.toString()}})
                },
                children: '课时配置'
              },
              edit: () => this.setState({visible: true, item: row}),
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
      },
    ];

    const gradeModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        console.log(payload);
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '年级成功'});
            this.setState({visible: false});
          }
        });
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
        <GradeModal {...gradeModalProps}/>
      </ListPage>
    );
  }
}


@Form.create({
  mapPropsToFields(props) {
    const {name, schoolYear, gradeIndex} = props.item || {};
    return {
      gradeIndex: Form.createFormField({value: gradeIndex ? gradeIndex.toString() : undefined}),
      name: Form.createFormField({value: name || undefined}),
      schoolYear: Form.createFormField({value: schoolYear || undefined}),
    }
  }
})
class GradeModal extends Component {
  render() {
    const {
      visible, onCancel, onOk, item,
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改年级' : '创建年级',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
            payload.name = GradeIndexEnum[payload.index];
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
              getFieldDecorator('gradeIndex', {
                rules: [{message: '请选择年级', required: true}]
              })(
                <Select placehold="请选择年级">
                  {
                    Enums(GradeIndexEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="入学年份" {...wrapper}>
            {
              getFieldDecorator('schoolYear', {
                rules: [{message: '请输入入学年份', required: true}]
              })(
                <Input maxLength={64} disabled={!!(item && item.id)}/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
