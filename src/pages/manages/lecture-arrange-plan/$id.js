import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {Button, Tabs, Row, Col, Empty, Spin, Popconfirm, message, Table, Select} from 'antd';
import Moment from 'moment';
import {Authenticate, ManagesLectureArrangePlan as namespace} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import styles from './$id.less';
import Flex from '../../../components/Flex';
import TimeTable from '../../../components/Timetable/CourseTable';


@connect(state => ({
  profile: state[Authenticate].authenticate || {},
  loading: state.loading.models[namespace],
  item: state[namespace].item,
  list: ((list, item) => list.filter(it => it.id !== item.id))(state[namespace].list || [], state[namespace].item || {}),
}))
export default class LectureArrangePlanDetail extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: namespace + '/set',
      payload: {
        list: [],
        item: null,
        loading: true
      }
    });
    dispatch({
      type: namespace + '/item',
      payload: {id},
      resolve: (item) => {
        dispatch({
          type: namespace + '/list',
          payload: {
            gradeId: item.gradeId,
            electionExamination: item.electionExamination,
            semesterId: item.semesterId,
          }
        })
      }
    });

  }

  render() {
    const {
      dispatch, profile, item, list = [], location, loading,
    } = this.props;

    const {query} = location;

    const schoolName = profile && profile.schoolName || '';


    const title = schoolName + '排课方案详情';

    const breadcrumb = ['选班排课', '排课详情'];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={[
      {
        key: 'rollback',
      },
    ]}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    const {selectedKey = "对比方案"} = this.state;

    return (
      <Page header={header} mainClassName={styles['arrange-plan-page']}
            location={location}
      >
        <div style={{height: '100%', overflow: 'auto', padding: 20, boxSizing: 'border-box'}}>

          {
            item ?
              <h1>{item.gradeName}</h1>
              :
              null
          }

          <Plan item={item} loading={!item || !!loading} dispatch={dispatch} enableRelease/>

          {
            item && query.noContrast * 1 !== 1 ?
              <Tabs defaultActiveKey="对比方案" onChange={(key) => {

                this.setState({selectedKey: key, [selectedKey]: list});

                if (this.state[key]) {
                  dispatch({
                    type: namespace + '/set',
                    payload: {
                      list: this.state[key]
                    }
                  });
                } else {
                  dispatch({
                    type: namespace + '/list',
                    payload: {
                      gradeId: item.gradeId,
                      electionExamination: key === '对比方案' ? item.electionExamination : !item.electionExamination,
                      semesterId: item.semesterId,
                    }
                  })
                }
              }}>
                <Tabs.TabPane tab="对比方案" key="对比方案">
                  {
                    item && selectedKey === '对比方案' && list.length ?
                      list.map(it =>
                        <Plan key={it.id} item={it} loading={it.loading} load={(id) => {
                          it.loading = true;
                          dispatch({
                            type: namespace + '/set',
                            payload: {
                              list: [...list]
                            }
                          });
                          dispatch({
                            type: namespace + '/fetchDetail',
                            payload: {id},
                          })
                        }}/>
                      )
                      :
                      <Empty description="暂无方案"/>
                  }
                </Tabs.TabPane>
              </Tabs>
              :
              null
          }

        </div>
      </Page>
    );
  }
}


function Plan({item = {}, loading, load, dispatch, enableRelease}) {
  return (
    <Spin spinning={!!loading}>
      <div className={styles['plan-item']}>
        {
          item ?
            <Fragment>
              <div span={8} className={styles['plan-item-left']}>
                <h1>
                  {item.name}
                  {
                    enableRelease ?
                      <Popconfirm title="真的要发布这个排课方案么？"
                                  okText="发布"
                                  cancelText="取消"
                                  onConfirm={() => {
                                    dispatch({
                                      type: namespace + '/release',
                                      payload: {
                                        id: item.id
                                      },
                                      resolve: (res) => {
                                        console.log('发布排课方案成功', res);
                                        message.success('发布成功');
                                      },
                                      reject: (error) => {
                                        console.error('发布排课方案失败', error);
                                        message.error('发布排课方案失败：' + error.message);
                                      }
                                    })
                                  }}>
                        <Button type="primary" size="small" style={{marginLeft: '2em'}}>发布</Button>
                      </Popconfirm>
                      :
                      null
                  }

                </h1>
                <div style={{marginBottom: 15}}>
                  {/*<a style={{marginRight: 50}}>重命名</a>*/}
                  <span>{new Moment(item.dateCreated).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
                <div className={styles['plan-item-label-list']}>
                  {
                    item.label && item.label.map(it =>
                      <span key={it}>{it}</span>
                    )
                  }
                </div>
                <p>{item.memo}</p>
                <h2>基础参数</h2>
                <Row className={styles['base-params']}>
                  <Col span={8}>
                    <label>年级</label>
                    <p>{item.gradeIndexName}</p>
                  </Col>
                  <Col span={16}>
                    <label>教学计划</label>
                    <p>{`${item.semesterAcademicYear}学年第${item.semesterType}学期`}</p>
                  </Col>
                  <Col span={8}>
                    <label>相关师资</label>
                    <p>{item.teacherNum}</p>
                  </Col>
                  <Col span={16}>
                    <label>相关场地</label>
                    <p>{item.roomNum}</p>
                  </Col>
                  {
                    item.electionExaminationPlanName ?
                      <Col span={8}>
                        <label>选考分班</label>
                        <p>{item.electionExaminationPlanName}</p>
                      </Col>
                      :
                      null
                  }
                  {
                    item.studyExaminationPlanName ?
                      <Col span={16}>
                        <label>学考分班</label>
                        <p>{item.studyExaminationPlanName}</p>
                      </Col>
                      :
                      null
                  }
                </Row>
              </div>
              <div className={styles['plan-item-main']}>
                {
                  item.lectureVMList && item.teacherKlassStatisticVMList ?
                    <Fragment>
                      <h2>师资分班</h2>
                      <TeacherKlassStatisticVMList list={item.teacherKlassStatisticVMList || []}/>
                    </Fragment>
                    :
                    null
                }
                {
                  item.lectureVMList && item.teacherKlassStatisticVMList ?
                    <Fragment>
                      <h2>课表</h2>
                      <Tabs>
                        <Tabs.TabPane key="grade-timetable" tab="年级课表">
                          <LectureVMList list={item.lectureVMList || []}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane key="class-timetable" tab="班级课表">
                          <KlassLectureVMList list={item.lectureVMList || []}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane key="teacher-timetable" tab="教师课表">

                        </Tabs.TabPane>
                      </Tabs>
                    </Fragment>
                    :
                    <Flex align="middle" justify="center">
                      <Button onClick={() => load(item.id)}>查看详情</Button>
                    </Flex>
                }

              </div>
            </Fragment>
            :
            null
        }
      </div>
    </Spin>
  )
}

function TeacherKlassStatisticVMList({list = [], mode = 'default'}) {


  const subjectMap = list.reduce((map, it) => {
    const subject = map[it.subjectId] || {
      id: it.subjectId,
      name: it.subjectName,
      teacherList: [],
      teacherMap: {},
    };
    subject.teacherList.push(it);
    map[it.subjectId] = subject;
    return map;
  }, {});

  if (mode === 'tabel') {
    const subjectList = Object.values(subjectMap);

    const data = subjectList.reduce((arr, it) => arr.concat(it.teacherList), []);

    const columns = [
      {
        title: '科目',
        key: 'subjectName',
        dataIndex: 'subjectName',
        width: 80,
        render: (v, it) => {
          const ret = {
            children: it.subjectName,
            props: {rowSpan: subjectMap[it.subjectId].rendered ? 0 : subjectMap[it.subjectId].teacherList.length}
          };
          subjectMap[it.subjectId].rendered = true;
          return ret;
        }
      },
      {title: '教师', key: 'teacherName', dataIndex: 'teacherName', width: 80,},
      {title: '每周课时', key: 'workCountOfWeek', dataIndex: 'workCountOfWeek', width: 70, className: 'tac'},
      {
        title: '授课班级', key: 'klassVMList', dataIndex: 'klassVMList', width: 'auto',
        render: v => v && v.map ? v.map(klass =>
          <span key={klass.id} style={{display: 'inline-block', width: 100}}>{klass.name}</span>
        ) : ''
      }
    ];

    return (
      <Table size="middle" bordered dataSource={data} columns={columns} rowKey="teacherId" pagination={false}/>
    );

  } else {
    return (
      <Tabs>
        {
          Object.entries(subjectMap).map(([id, subject]) =>
            <Tabs.TabPane tab={subject.name} key={id}>
              {
                subject.teacherList.map((teacher, index) =>
                  <Flex className={styles['teacher-detail']} key={[teacher.teacherId, index].join('-')}>
                    <div className={styles['teacher-name']}>{teacher.teacherName}</div>
                    <div style={{width: 100}}>{`每周课时：${teacher.workCountOfWeek}`}</div>
                    <Flex.Item>
                      {
                        teacher.klassVMList.map(klass =>
                          <span key={klass.id} style={{display: 'inline-block', width: 100}}>{klass.name}</span>
                        )
                      }
                    </Flex.Item>
                  </Flex>
                )
              }
            </Tabs.TabPane>
          )
        }
      </Tabs>
    )
  }
}

function LectureVMList({list = [], mode = 'grade'}) {

  const periodMap = {};
  const roomList = Object.values(list.reduce((map, it) => {
    const {id, name} = it.room;
    map[id] = {id, name: name.trim()};
    periodMap[it.period.id] = it.period;
    return map;
  }, {})).sort((a, b) => a.name - b.name);
  const periodList = Object.values(periodMap);

  const timetableProps = {
    periodList,
    roomList,
    lectureList: list,
  };

  const min = mode === 'grade' ? Math.floor((window.innerHeight - 145) / 90) : 8;

  console.log(timetableProps);

  return (
    <div style={{height: (min * 90 + 45) || 0, display: 'flex'}}>
      <TimeTable {...timetableProps} mode={mode}/>
    </div>
  )
}

class KlassLectureVMList extends Component {

  constructor(props) {
    super(...arguments);

    this.state = {};

    this.transformProps(props, false);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.list !== this.props.list) {
      this.transformProps(nextProps, true);
    }
  }

  transformProps = (props, isMounted) => {
    const {list = []} = props;
    const klassList = Object.values(list.reduce((map, it) => {
      if (it.klass) {
          const key = [it.klass.id, it.klass.type].join('-');
          const klassLectureVM = map[key] || {...it.klass, list: []};
          klassLectureVM.list.push(it);
          map[key] = klassLectureVM;
      }
      return map;
    }, {}));

    console.log(klassList);

    if (isMounted) {
      this.setState({klassList});
    } else {
      this.state.klassList = klassList;
    }
  };

  onSelectChange = (value, {props: {klass}}) => {
    this.setState({klass});
  };


  render() {

    const {klassList = [], klass} = this.state;

    return (
      <div>
        <Select onChange={this.onSelectChange} style={{width: 300}} placeholder="请选择班级">
          {
            klassList.map(klass =>
              <Select.Option key={[klass.id, klass.type].join('-')} klass={klass}>{klass.name}</Select.Option>
            )
          }
        </Select>
        {
          klass && <LectureVMList list={klass.list || []} mode="klass"/>
        }
      </div>
    )
  }
}
