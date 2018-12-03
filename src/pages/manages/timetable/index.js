import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import {Form, Row, Col, message, Modal, Select, DatePicker, Input, notification, Switch} from 'antd';
import {ManagesGrade, ManagesSemester, ManagesTimetable as namespace} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {SemesterTypeEnum, Enums} from "../../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  semesterList: state[ManagesSemester].list,
  gradeList: state[ManagesGrade].list
}))
export default class ManagesTimetable extends Component {

  state = {};

  componentDidMount() {
    this.props.dispatch({
      type: ManagesSemester + '/list',
      payload: {
        s: 10000
      }
    });
    this.props.dispatch({
      type: ManagesGrade + '/list',
      payload: {
        s: 10000
      }
    });
  }

  render() {
    const {list, total, loading, location, dispatch, semesterList = [], gradeList = []} = this.props;

    const {pathname, query} = location;

    const title = '课时列表';

    const breadcrumb = ['管理', '课时管理', title];

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

    const semesterMap = semesterList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '年级', key: 'gradeId', render: v => gradeMap[v] ? gradeMap[v].name : v},
      {
        title: '学期', key: 'semesterId', width: 120,
        render: v => semesterMap[v] ? (semesterMap[v].academicYear + '学年第' + semesterMap[v].semesterType + '学期') : v
      },
      {title: '开始时间', key: 'startTime', render: v => moment(v).format('hh:mm:ss')},
      {title: '时长', key: 'interval', render: v => v ? v + '分钟' : ''},
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
      gradeList, semesterList,
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
        <ManagesTimetableModal {...managesTimetableModalProps}/>
      </ListPage>
    );
  }
}

@Form.create({
  mapPropsToFields(props) {
    let {gradeId, semesterId, startTime, interval} = props.item || {};

    if(startTime || startTime === 0){
      startTime = moment(startTime).format('hh:mm:ss');
    }


    return {
      gradeId: Form.createFormField({value: gradeId || undefined}),
      semesterId: Form.createFormField({value: semesterId || undefined}),
      startTime: Form.createFormField({value: startTime || undefined}),
      interval: Form.createFormField({value: interval || undefined}),
    }
  }
})
class ManagesTimetableModal extends Component {
  render() {
    const {
      visible, onCancel, onOk, item, gradeList = [], semesterList = [],
      form: {getFieldDecorator, validateFieldsAndScroll, setFields, getFieldValue, setFieldsValue}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改课时' : '创建课时',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
            payload.startTime = moment('1970-01-01 ' + payload.startTime).valueOf();
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
          <Form.Item label="年级" {...wrapper}>
            {
              getFieldDecorator('gradeId', {
                rules: [{message: '请选择年级', required: true}]
              })(
                <Select placeholder="请选择年级" style={selectStyle} disabled={!!(item && item.id)}>
                  {
                    gradeList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="学期" {...wrapper}>
            {
              getFieldDecorator('semesterId', {
                rules: [{message: '请选择学期', required: true}]
              })(
                <Select placeholder="请选择" style={selectStyle} disabled={!!(item && item.id)}>
                  {
                    semesterList.map(it =>
                      <Select.Option key={it.id} value={it.id}>
                        {it.academicYear + '学年第' + it.semesterType + '学期'}
                      </Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="开始时间" {...wrapper}>
            {
              getFieldDecorator('startTime', {
                rules: [
                  {message: '请输入开始时间', required: true},
                  {pattern: /^[0-2]\d:[0-5]\d:[0-5]\d$/g, message: '请输入正确的时间'}
                ]
              })(
                <Input maxLength={8} placeholder="08:00:00" onChange={(e) => {
                  let value = e.target.value.replace(/[^\d\:]/g, '');
                  if (value.length === 2 || value.length === 5) {
                    const v = getFieldValue('startTime') || '';
                    if (v.length < value.length) {
                      setTimeout(() => {
                        setFields({startTime: {value: value + ':'}});
                      });
                    }
                  } else if (value.length === 1) {
                    if (parseInt(value) > 2) {
                      const v = getFieldValue('startTime') || '';
                      if (v.length < value.length) {
                        setTimeout(() => {
                          setFields({startTime: {value: '0' + value + ':'}});
                        });
                      }
                    }
                  } else if (value.length === 4) {
                    if (parseInt(value.substr(3, 1)) > 5) {
                      const v = getFieldValue('startTime') || '';
                      if (v.length < value.length) {
                        setTimeout(() => {
                          setFields({startTime: {value: value.substr(0, 3) + '0' + value.substr(3, 1) + ':'}});
                        });
                      }
                    }
                  } else if (value.length === 7) {
                    if (parseInt(value.substr(6, 1)) > 5) {
                      const v = getFieldValue('startTime') || '';
                      if (v.length < value.length) {
                        setTimeout(() => {
                          setFields({startTime: {value: value.substr(0, 6) + '0' + value.substr(6, 1)}});
                        });
                      }
                    }
                  }
                }}/>
              )
            }
          </Form.Item>
          <Form.Item label="时长" {...wrapper}>
            {
              getFieldDecorator('interval', {
                rules: [{message: '请输入时长', required: true}]
              })(
                <Input maxLength={3} placeholder="45"/>
              )
            }
          </Form.Item>

        </Form>
      </Modal>
    )
  }
}
