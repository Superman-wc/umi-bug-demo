import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {Button, Tabs, Row, Col, Empty, Spin} from 'antd';
import Moment from 'moment';
import {Authenticate, ManagesLectureArrangePlan as namespace} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import styles from './$id.less';
import Flex from '../../../components/Flex';
import TimeTable from '../../../components/Timetable/CourseTable';


@connect(state => ({
  profile: state[Authenticate].authenticate || {},
  loading: state[namespace].loading,
  item: state[namespace].item,
  list: ((list, item) => list.filter(it => it.id !== item.id))(state[namespace].list || [], state[namespace].item || {}),
}))
export default class DashboardPage extends Component {

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
      dispatch, profile, item, list = [],
    } = this.props;

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

    console.log(list);

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

          <Plan item={item} loading={!item}/>

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
        </div>
      </Page>
    );
  }
}


function Plan({item = {}, loading, load}) {
  return (
    <Spin spinning={!!loading}>
      <Row className={styles['plan-item']}>
        {
          item ?
            <Fragment>
              <Col span={8} className={styles['plan-item-left']}>
                <h1>{item.name}</h1>
                <div style={{marginBottom: 15}}>
                  <a style={{marginRight: 50}}>重命名</a>
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
                  <Col span={6}>
                    <label>年级</label>
                    <p>{item.gradeIndexName}</p>
                  </Col>
                  <Col span={18}>
                    <label>教学计划</label>
                    <p>{`${item.semesterAcademicYear}学年第${item.semesterType}学期`}</p>
                  </Col>
                  <Col span={6}>
                    <label>相关师资</label>
                    <p>{item.teacherNum}</p>
                  </Col>
                  <Col span={18}>
                    <label>相关场地</label>
                    <p>{item.roomNum}</p>
                  </Col>
                  <Col span={24}>
                    <label>选考分班</label>
                    <p>{item.electionExaminationPlanName}</p>
                  </Col>
                  <Col span={24}>
                    <label>学考分班</label>
                    <p>{item.studyExaminationPlanName}</p>
                  </Col>


                </Row>
              </Col>
              <Col span={16} className={styles['plan-item-main']}>
                {
                  item.lectureVMList && item.teacherKlassStatisticVMList ?
                    <Fragment>

                      <h2>师资分班</h2>
                      <TeacherKlassStatisticVMList list={item.teacherKlassStatisticVMList || []}/>
                      <h2>年级课表</h2>
                      <LectureVMList list={item.lectureVMList || []}/>
                    </Fragment>
                    :
                    <Flex align="middle" justify="center">
                      <Button onClick={() => load(item.id)}>查看详情</Button>
                    </Flex>
                }

              </Col>
            </Fragment>
            :
            null
        }
      </Row>
    </Spin>
  )
}

function TeacherKlassStatisticVMList({list = []}) {
  const subjectMap = list.reduce((map, it) => {
    const subject = map[it.subjectId] || {id: it.subjectId, name: it.subjectName, teacherList: []};
    subject.teacherList.push(it);
    map[it.subjectId] = subject;
    return map;
  }, {});
  return (
    <Tabs>
      {
        Object.entries(subjectMap).map(([id, subject]) =>
          <Tabs.TabPane tab={subject.name} key={id}>
            {
              subject.teacherList.map(teacher =>
                <Flex className={styles['teacher-detail']} key={teacher.teacherId}>
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

function LectureVMList({list = []}) {

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

  console.log(periodList);

  return (
    <div style={{height: (Math.min(periodList.length, 4) * 90 + 45) || 0, display: 'flex'}}>
      <TimeTable {...timetableProps} />
    </div>
  )
}
