import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Button, Card, Tabs, Empty} from 'antd';
import classNames from 'classnames';
import Moment from 'moment';
import {Authenticate, ManagesStudentArrangePlan as namespace} from '../../../utils/namespace';
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
                  <Empty description="暂无方案"/>
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
    <Card loading={!!loading} className={styles['plan-item']}>
      {
        item ?
          <Flex>
            <div style={{width: '40%', marginRight: 20}}>
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
            </div>
            <Flex.Item>
              {
                item.subjectKlassPlanVMList && item.subjectKlassPlanVMList.length ?
                  <Flex className={classNames(styles['subject-klass-plan'], styles['table'])}>
                    <Flex.Item className={styles['table-th']}>
                      <div className={styles['cell']}>学科</div>
                      <div className={styles['cell']}>分层</div>
                      <div className={styles['cell']}>非分层</div>
                    </Flex.Item>
                    {
                      item.subjectKlassPlanVMList.map(it =>
                        <Flex.Item key={it.subjectName}>
                          <div className={styles['cell']}>{it.subjectName}</div>
                          <div className={styles['cell']}>{it.hierarchyNum || '-'}</div>
                          <div className={styles['cell']}>{it.noHierarchyNum || '-'}</div>
                        </Flex.Item>
                      )
                    }
                  </Flex>
                  :
                  null
              }
              {
                item.timeslotKlassPlanVMList ?
                  <TimeslotKlassPlanList list={item.timeslotKlassPlanVMList}/>
                  :
                  null
              }
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

function TimeslotKlassPlanList({list = []}) {
  const table = list.sort((a, b) => a.timeslot - b.timeslot).reduce((map, it) => {
    const arr = map[it.timeslot] || [];
    arr.push(it);
    map[it.timeslot] = arr;
    return map;
  }, {});

  return (
    <div className={classNames(styles['timeslot-klass-plan'], styles['table'])}>
      {
        Object.entries(table).map(([timeslot, arr]) =>
          <Flex key={timeslot} className={styles['timeslot-klass-plan-row']}>

            <div className={classNames(styles['table-th'], styles['cell'])}
                 style={{width: '12.5%'}}>{`第${timeslot * 1 + 1}节`}</div>

            {
              arr.sort((a, b) => a.subjectId - b.subjectId).map(it =>
                <Flex.Item key={it.klassName} className={classNames(styles['cell'], styles[it.subjectCode])}>
                  {it.klassName}<br/>{`男${it.femaleNum} / 女${it.maleNum}`}
                </Flex.Item>
              )
            }
          </Flex>
        )
      }
    </div>
  )
}
