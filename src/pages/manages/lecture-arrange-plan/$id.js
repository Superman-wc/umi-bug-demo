import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import { Button, Card, Tabs, Row, Col} from 'antd';
import classNames from 'classnames';
import Moment from 'moment';
import {Authenticate, ManagesLectureArrangePlan as namespace} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import styles from './$id.less';
import Flex from '../../../components/Flex';



@connect(state => ({
  profile: state[Authenticate].authenticate || {},
  loading: state[namespace].loading,
  item: state[namespace].item,
  list: ((list, item) => list.filter(it => it.id !== item.id))(state[namespace].list || [], state[namespace].item || {}),
}))
export default class DashboardPage extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, location: {query}, match: {params: {id}}} = this.props;
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
      loading, location, dispatch, profile, item, list = [],
    } = this.props;

    const {pathname, query} = location;

    const schoolName = profile && profile.schoolName || '';


    const title = schoolName + '分班方案详情';

    const breadcrumb = ['选班排课', '分班详情'];

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
              <h1>{item.gradeName} - {item.electionExamination ? '选考' : '学考'}</h1>
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
                  <div style={{textAlign: 'center', padding: 50}}>暂无方案</div>
              }
            </Tabs.TabPane>

            <Tabs.TabPane tab={`可配套${item && item.electionExamination ? '学考' : '选考'}方案`} key="配套方案">
              {
                item && selectedKey === '配套方案' && list.length ?
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
                  <div style={{textAlign: 'center', padding: 50}}>暂无方案</div>
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
    <Card loading={!!loading} className={styles['plan-item']}>
      {
        item ?
          <Flex>
            <div style={{width: '40%', marginRight: 20}}>
              <h1>{item.planName}</h1>
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
            </div>
            <Flex.Item>
              <h2>基础参数</h2>
              <Row className={styles['base-params']}>
                <Col span={4}>
                  <label>年级</label>
                  <p>{item.gradeIndexName}</p>
                </Col>
                <Col span={8}>
                  <label>教学计划</label>
                  <p>{`${item.semesterAcademicYear}学年第${item.semesterType}学期`}</p>
                </Col>
                <Col span={6}>
                  <label>相关师资</label>
                  <p>{item.teacherNum}</p>
                </Col>
                <Col span={6}>
                  <label>相关场地</label>
                  <p>{item.roomNum}</p>
                </Col>
                <Col span={12}>
                  <label>选考分班</label>
                  <p>{item.electionExaminationPlanName}</p>
                </Col>
                <Col span={12}>
                  <label>学考分班</label>
                  <p>{item.studyExaminationPlanName}</p>
                </Col>


              </Row>
              <h2>师资分班</h2>
              <TeacherKlassStatisticVMList list={item.teacherKlassStatisticVMList||[]} />
              {
                !item.subjectKlassPlanVMList || !item.timeslotKlassPlanVMList ?
                  <Flex align="middle" justify="center">
                    <Button onClick={() => load(item.id)}>查看详情</Button>
                  </Flex>
                  :
                  null
              }
            </Flex.Item>
          </Flex>
          :
          null
      }
    </Card>
  )
}

function TeacherKlassStatisticVMList({list=[]}){
  const subjectMap = list.reduce((map, it)=>{
    const subject = map[it.subjectId] || {id:it.subjectId, name:it.subjectName, teacherList:[]};
    subject.teacherList.push(it);
    map[it.subjectId] = subject;
    return map;
  }, {});

  console.log(list, subjectMap);

  return (
    <Tabs>
      {
        Object.entries(subjectMap).map(([id, subject])=>
          <Tabs.TabPane tab={subject.name} key={id}>
            {
              subject.teacherList.map(teacher=>
                <Flex key={teacher.teacherId} style={{height:'auto'}}>
                  <div style={{width:60}}>{teacher.teacherName}</div>
                  <Flex.Item>
                    {
                      teacher.klassVMList.map(klass=>
                        <span key={klass.id} style={{display:'inline-block', width:100}}>{klass.name}</span>
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
