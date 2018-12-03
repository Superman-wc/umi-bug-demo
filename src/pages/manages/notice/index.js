import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import {Form, Row, Col, message, Modal, Select, DatePicker, Input, notification, Switch} from 'antd';
import {ManagesGrade, ManagesSemester, ManagesNotice as namespace} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {NoticeTypeEnum, Enums} from "../../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list
}))
export default class ManagesNotice extends Component {

  state = {};

  componentDidMount() {
    this.props.dispatch({
      type: ManagesGrade + '/list',
      payload: {
        s: 10000
      }
    });
  }

  render() {
    const {list, total, loading, location, dispatch, gradeList = []} = this.props;

    const {pathname, query} = location;

    const title = '公告新闻列表';

    const breadcrumb = ['管理', '公告新闻管理', title];

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


    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '类型', key: 'type', render: v => NoticeTypeEnum[v] || v},
      {title: '年级', key: 'gradeId', render: v => gradeMap[v] ? gradeMap[v].name : v},
      {title: '标题', key: 'title',},
      {title: '内容', key: 'content',},
      {title: '图片', key: 'picUrl', render: v => v ? <img src={v + '!t'}/> : ''},
      {title: '新闻链接', key: 'newsUrl', render: v => v ? <a href={v} target="_blank">{v}</a> : ''},
      {title: '发布时间', key: 'newsTime', render: v => moment(v).format('YYYY-MM-DD hh:mm:ss')},
      {title: '创建时间', key: 'dateCreated'},
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

    const managesTimetableModalProps = {
      gradeList,
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        console.log(payload);
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '课时成功'});
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
        <ManagesNoticeModal {...managesTimetableModalProps}/>
      </ListPage>
    );
  }
}

@Form.create({
  mapPropsToFields(props) {
    let {type, gradeId, newsTime, title, picUrl, newsUrl, content} = props.item || {};

    return {
      type: Form.createFormField({value: type || undefined}),
      gradeId: Form.createFormField({value: gradeId || undefined}),
      title: Form.createFormField({value: title || undefined}),
      newsTime: Form.createFormField({value: newsTime || undefined}),
      picUrl: Form.createFormField({value: picUrl || undefined}),
      newsUrl: Form.createFormField({value: newsUrl || undefined}),
      content: Form.createFormField({value: content || undefined}),
    }
  }
})
class ManagesNoticeModal extends Component {
  state = {};

  render() {
    const {
      visible, onCancel, onOk, item, gradeList = [],
      form: {getFieldDecorator, validateFieldsAndScroll, setFields, getFieldValue, setFieldsValue}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改公告' : '创建公告',
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
    const selectStyle = {width: '100%'};
    return (
      <Modal {...modalProps}>
        <Form layout="horizontal">
          <Form.Item label="类型" {...wrapper}>
            {
              getFieldDecorator('type', {
                rules: [{message: '请选择类型', required: true}]
              })(
                <Select placeholder="请选择类型" style={selectStyle} onChange={type => {
                  this.setState({type});
                  const gradeId = getFieldValue('gradeId');
                  setFields({gradeId: {value: gradeId, errors: null}});
                }}>
                  {
                    Enums(NoticeTypeEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="年级" {...wrapper}>
            {
              getFieldDecorator('gradeId', {
                rules: [{message: '请选择年级', required: this.state.type * 1 === NoticeTypeEnum.年级公告 * 1}]
              })(
                <Select placeholder="请选择年级" style={selectStyle}>
                  {
                    gradeList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>

          <Form.Item label="标题" {...wrapper}>
            {
              getFieldDecorator('title', {
                rules: [{message: '请输入标题', required: true}]
              })(
                <Input maxLength={255} placeholder="请输入标题"/>
              )
            }
          </Form.Item>
          <Form.Item label="内容" {...wrapper}>
            {
              getFieldDecorator('content', {
                rules: [{message: '请输入内容', required: true}]
              })(
                <Input.TextArea placeholder="请输入" autosize={{minRows: 5, maxRows: 10}}/>
              )
            }
          </Form.Item>
          <Form.Item label="图片" {...wrapper}>
            {
              getFieldDecorator('picUrl', {
                rules: [{message: '请输入图片', required: true}]
              })(
                <Input maxLength={255} placeholder="请输入图片"/>
              )
            }
          </Form.Item>
          <Form.Item label="链接" {...wrapper}>
            {
              getFieldDecorator('newsUrl', {
                rules: [{message: '请输入链接', required: true}]
              })(
                <Input maxLength={255} placeholder="请输入链接"/>
              )
            }
          </Form.Item>

        </Form>
      </Modal>
    )
  }
}
