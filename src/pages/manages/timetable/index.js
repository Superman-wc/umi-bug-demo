import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import {Form, Row, Col, message, Modal, Select, Button, Input, notification, Tabs} from 'antd';
import {ManagesGrade, ManagesSemester, ManagesTimetable as namespace} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {SemesterTypeEnum, Enums, WEEK, GradeIndexEnum, EnableStatusEnum} from "../../../utils/Enum";
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import Flex from "../../../components/Flex";
import router from "umi/router";


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

    const semesterMap = semesterList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const title = [
      query.semesterType ? semesterName(semesterMap[query.semesterType]) : '',
      query.gradeIndex && gradeMap[query.gradeIndex] ? gradeMap[query.gradeIndex].name : '',
      query.dayOfWeek ? WEEK[query.dayOfWeek] : '',
      '课时列表'
    ].filter(it => !!it);

    const breadcrumb = ['管理', '课时管理', title[title.length - 1]];

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
      {
        title: '年级', key: 'gradeIndex',
        render: v => GradeIndexEnum[v] || v,
        filters: Enums(GradeIndexEnum).map(it => ({value: it.value, text: it.name})),
        filtered: !!query.gradeIndex,
        filterMultiple: false,
        filteredValue: query.gradeIndex ? [query.gradeIndex] : [],
      },
      {
        title: '学期', key: 'semesterType',
        render: v => SemesterTypeEnum[v] || v,
        filters: Enums(SemesterTypeEnum).map(it => ({value: it.value, text: it.name})),
        filtered: !!query.semesterType,
        filterMultiple: false,
        filteredValue: query.semesterType ? [query.semesterType] : [],
      },
      {
        title: '星期', key: 'dayOfWeek',
        render: v => WEEK[v + 1] || v,
        filters: Enums(WEEK).map(it => ({value: it.value - 1, text: it.name})),
        filtered: !!query.dayOfWeek,
        filterMultiple: false,
        filteredValue: query.dayOfWeek ? [query.dayOfWeek] : [],
      },
      {title: '开始时间', key: 'startTime', render: v => moment(v).format('HH:mm:ss')},
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
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        console.log(payload);
        this.setState({item: payload});
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
        list={list && query.dayOfWeek ? list.sort((a, b) => a.startTime - b.startTime) : list}
        total={total}
        pagination
        title={title.join('')}
      >
        <ManagesTimetableModal {...managesTimetableModalProps}/>
      </ListPage>
    );
  }
}

@Form.create({
  mapPropsToFields(props) {
    let {gradeIndex, semesterType, startTime, interval, dayOfWeek} = props.item || {};

    if (startTime || startTime === 0) {
      startTime = moment(startTime).format('HH:mm:ss');
    }

    return {
      gradeIndex: Form.createFormField({value: gradeIndex ? gradeIndex.toString() : undefined}),
      semesterType: Form.createFormField({value: semesterType ? semesterType.toString() : undefined}),
      startTime: Form.createFormField({value: startTime || undefined}),
      interval: Form.createFormField({value: interval || undefined}),
      dayOfWeek: Form.createFormField({value: (dayOfWeek || dayOfWeek === 0) ? (dayOfWeek + 1).toString() : undefined}),
    }
  }
})
class ManagesTimetableModal extends Component {
  render() {
    const {
      visible, onCancel, onOk, item,
      form: {getFieldDecorator, validateFieldsAndScroll, setFields, getFieldValue}
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
            payload.dayOfWeek = (parseInt(payload.dayOfWeek, 10) - 1).toString();

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
              getFieldDecorator('gradeIndex', {
                rules: [{message: '请选择年级', required: true}]
              })(
                <Select placeholder="请选择年级" style={selectStyle} disabled={!!(item && item.id)}>
                  {
                    Enums(GradeIndexEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="学期" {...wrapper}>
            {
              getFieldDecorator('semesterType', {
                rules: [{message: '请选择学期', required: true}]
              })(
                <Select placeholder="请选择" style={selectStyle} disabled={!!(item && item.id)}>
                  {
                    Enums(SemesterTypeEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="星期" {...wrapper}>
            {
              getFieldDecorator('dayOfWeek', {
                rules: [{message: '请选择星期', required: true}]
              })(
                <Select placeholder="请选择星期" style={selectStyle} disabled={!!(item && item.id)}>
                  {
                    Enums(WEEK).map((it) =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
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
                  } else {
                    setTimeout(() => {
                      setFields({startTime: {value}});
                    });
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

function semesterName(it) {
  return it ? (it.academicYear + '学年第' + it.semesterType + '学期') : '';
}

/**
 * 还是先不实现表格形式的编辑形式
 */
class TimetableConfigPage extends Component {

  state = {};

  render() {
    const {
      loading, location, dispatch,
    } = this.props;

    const {pathname, query} = location;

    const title = [
      query.gradeIndex ? GradeIndexEnum[query.gradeIndex] : '',
      query.semesterType ? SemesterTypeEnum[query.semesterType] : '',
      '课时列表'
    ].filter(it => !!it);

    const breadcrumb = ['管理', '课时管理', title[title.length - 1]];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={[]}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title.join('')} operation={headerOperation}/>
    );

    console.log(this.state);

    return (
      <Page header={header}
            location={location}
            loading={!!loading}
      >
        <Tabs type="card" style={{margin: 10}} activeKey={query.gradeIndex} onChange={(gradeIndex) => {
          router.replace({pathname, query: {...query, gradeIndex}});
        }}>
          {
            Enums(GradeIndexEnum).map(grade =>
              <Tabs.TabPane key={grade.value} tab={grade.name}>
                <Tabs type="card" activeKey={query.semesterType} onChange={(semesterType => {
                  router.replace({pathname, query: {...query, semesterType}});
                })}>
                  {
                    Enums(SemesterTypeEnum).map(semester =>
                      <Tabs.TabPane key={semester.value} tab={semester.name}>
                        <WeekStartTimeInterval
                          value={this.state.list}
                          onChange={(list) => {
                            this.setState({list});
                          }}/>
                      </Tabs.TabPane>
                    )
                  }
                </Tabs>
              </Tabs.TabPane>
            )
          }
        </Tabs>
      </Page>
    )
  }
}

class WeekStartTimeInterval extends Component {

  onPlus = () => {
    const {value, onChange} = this.props;
    if (onChange) {
      const arr = value || [];
      onChange([...arr, {dayOfWeek: arr.length, list: []}]);
    }
  };

  render() {
    const {value, onChange} = this.props;
    const arr = value || [];
    return (
      <Flex>
        {
          value && value.length ?
            value.map((it, index) =>
              <Flex.Item key={it.dayOfWeek} style={{padding: 5, maxWidth: 200}}>
                <DayStartTimeInterval value={it} onChange={(v) => {
                  value[index] = v;
                  onChange && onChange([...value]);
                }}/>
              </Flex.Item>
            )
            :
            null
        }
        {
          arr.length < 7 ?
            <Button icon="plus" onClick={this.onPlus}>添加{WEEK[arr.length + 1]}</Button>
            :
            null
        }
      </Flex>
    )
  }
}

class DayStartTimeInterval extends Component {

  onAdd = () => {
    const {onChange, value} = this.props;
    if (onChange) {
      onChange({...value, list: [...(value && value.list || []), {}]});
    }
  };

  render() {
    const {onChange, value} = this.props;
    const dayOfWeek = value && value.dayOfWeek || 0;
    const list = value && value.list || [];
    return (
      <div>
        <h3 style={{textAlign: 'center'}}>{WEEK[dayOfWeek + 1]}</h3>
        {
          list && list.length ?
            list.map((it, index) =>
              <StartTimeInterval key={dayOfWeek + '-' + index} value={it} style={{marginBottom: 15}} onChange={(v) => {
                list[index] = v;
                onChange && onChange({...value, list: [...list]});
              }}/>
            )
            :
            null
        }
        <Button icon="plus" style={{width: '100%'}} onClick={this.onAdd}>添加</Button>
      </div>
    )
  }
}

class StartTimeInterval extends Component {

  onStartTimeChange = e => {
    const {onChange, value = {}} = this.props;
    if (onChange) {
      let ev = e.target.value.replace(/[^\d\:]/g, '');
      let v = value && value.startTime || '';
      let interval = value && value.interval;
      if (ev.length === 2 || ev.length === 5) {
        if (v.length < value.length) {
          onChange({startTime: ev + ':', interval});
        }
      } else if (ev.length === 1) {
        if (parseInt(ev, 10) > 2) {
          if (v.length < value.length) {
            onChange({startTime: '0' + ev + ':', interval});
          }
        }
      } else if (ev.length === 4) {
        if (parseInt(ev.substr(3, 1), 10) > 5) {
          if (v.length < ev.length) {
            onChange({startTime: ev.substr(0, 3) + '0' + ev.substr(3, 1) + ':', interval});
          }
        }
      } else if (ev.length === 7) {
        if (parseInt(ev.substr(6, 1), 10) > 5) {
          if (v.length < ev.length) {
            onChange({startTime: ev.substr(0, 6) + '0' + ev.substr(6, 1), interval});
          }
        }
      } else {
        onChange({startTime: ev + ':', interval});
      }
    }
  };
  onIntervalChange = e => {
    const {onChange, value} = this.props;
    onChange && onChange({...value, interval: e.target.value});
  };

  render() {
    const {style, value} = this.props;

    return (
      <Input.Group style={style}>
        <Input placeholder="起始时间"
               onChange={this.onStartTimeChange}
               value={value && value.startTime}
               style={{display: 'block', width: '60%'}}/>
        <Input placeholder="时长"
               onChange={this.onIntervalChange}
               value={value && value.interval}
               style={{display: 'block', width: '40%', marginLeft: -1}}/>
      </Input.Group>
    );
  }
}

