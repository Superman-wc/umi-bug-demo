import React, {Component} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {Form,Modal, Select, DatePicker, Input, notification, Switch} from 'antd';
import {ManagesSemester as namespace, ManagesSemesterDetail} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {SemesterTypeEnum, Enums} from "../../../utils/Enum";
import router from 'umi/router';

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

    const title = '学期列表';

    const breadcrumb = ['管理', '学期管理', title];

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
      {title: '学年', key: 'academicYear'},
      {title: '学期', key: 'semesterType', render: v => SemesterTypeEnum[v]},
      {title: '开学时间', key: 'startDate', render: v => moment(v).format('YYYY-MM-DD')},
      {title: '放假时间', key: 'endDate', render: v => moment(v).format('YYYY-MM-DD')},
      {
        title: '是否当前学期', key: 'currentType',
        render: (v, row) =>
          <Switch checked={v === 1}
                  disabled={v === 1}
                  checkedChildren="是"
                  unCheckedChildren="否"
                  onChange={(e) => {
                    dispatch({
                      type: namespace + '/modify',
                      payload: {
                        id: row.id,
                        currentType: e ? 1 : 0
                      },
                      resolve: () => {
                        dispatch({
                          type: namespace + '/list',
                          payload: {
                            ...query
                          }
                        })
                      }
                    })
                  }}
          />
      },
      {title: '创建时间', key: 'dateCreated'},
      {
        title: '操作',
        key: 'operate',
        render: (id, row) => {
          let operation;
          if (row.currentType === 0) {
            operation = <TableCellOperation
              operations={{
                edit: () => this.setState({visible: true, item: row}),
                remove: {
                  onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
                },
              }}
            />
          } else {
            operation = <TableCellOperation
              operations={{
                teachCalendar: () => {
                  router.push({
                    pathname: ManagesSemesterDetail,
                    query: {
                      id: row.id,
                      academicYear: row.academicYear,
                      semesterType: row.semesterType,
                      startDate: row.startDate,
                      endDate: row.endDate,
                      year:moment(row.startDate).year(),
                    }
                  });
                },
                edit: () => this.setState({visible: true, item: row}),
                remove: {
                  onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
                },
              }}
            />
          }
          return operation;
        },
      },
    ];

    const semesterModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        console.log(payload);
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '学期成功'});
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
        <SemesterModal {...semesterModalProps}/>
      </ListPage>
    );
  }
}

@Form.create({
  mapPropsToFields(props) {
    const {academicYear, semesterType, startDate, endDate} = props.item || {};
    return {
      academicYear: Form.createFormField({value: academicYear || undefined}),
      semesterType: Form.createFormField({value: semesterType && semesterType.toString() || undefined}),
      startDate: Form.createFormField({value: startDate && endDate && [moment(startDate), moment(endDate)] || undefined}),
    }
  }
})
class SemesterModal extends Component {
  render() {
    const {
      visible, onCancel, onOk, item,
      form: {getFieldDecorator, validateFieldsAndScroll, getFieldsValue, setFieldsValue}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改学期' : '创建学期',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
            payload.endDate = payload.startDate[1].valueOf();
            payload.startDate = payload.startDate[0].valueOf();
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
          <Form.Item label="学期" {...wrapper}>
            {
              getFieldDecorator('startDate', {
                rules: [{message: '请输入学期的开始时间与结束时间', required: true}]
              })(
                <DatePicker.RangePicker format="YYYY-MM-DD" showTime={false} onChange={([start, end]) => {
                  const sy = start.year();
                  const ey = end.year();
                  const vv = getFieldsValue(['academicYear', 'semesterType']);
                  Object.keys(vv).forEach(k => {
                    if (typeof vv[k] === 'undefined') {
                      delete vv[k]
                    }
                  });
                  const v = {
                    academicYear: sy === ey ? `${ey - 1}~${ey}` : `${sy}~${ey}`,
                    semesterType: sy === ey ? SemesterTypeEnum.下学期.toString() : SemesterTypeEnum.上学期.toString(),
                    ...vv
                  };
                  setFieldsValue(v);
                }}/>
              )
            }
          </Form.Item>
          <Form.Item label="学年" {...wrapper}>
            {
              getFieldDecorator('academicYear', {
                rules: [{message: '请输入学年名称', required: true}]
              })(
                <Input maxLength={64} placeholder="2018~2019"/>
              )
            }
          </Form.Item>
          <Form.Item label="学期" {...wrapper}>
            {
              getFieldDecorator('semesterType', {
                rules: [{message: '请选择学期', required: true}]
              })(
                <Select placeholder="请选择" style={selectStyle}>
                  {
                    Enums(SemesterTypeEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
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
