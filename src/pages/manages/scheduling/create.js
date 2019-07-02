import React, {Component, Fragment, createRef} from 'react';
import router from 'umi/router';
import {connect} from 'dva';
import {
  Form,
  Steps,
  Button,
  Select,
  InputNumber,
  Checkbox,
  Row,
  Col,
  message,
  Dropdown,
  Menu
} from 'antd';
import classNames from 'classnames';
import {
  ManagesClass,
  ManagesGrade, ManagesSubject,
  ManagesTeacher,
  ManagesScheduling as namespace,
} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from "../../../components/Page/HeaderOperation";
import styles from './create.less';


@connect(state => ({
  gradeList: state[ManagesGrade].list,
  klassList: state[ManagesClass].list,
  subjectList: state[ManagesSubject].list,
  loading: state[ManagesGrade].loading || state[ManagesClass].loading,
}))
export default class CreateScheduling extends Component {

  state = {
    current: 0,
    teacherMapOfSubjectId: {},
    policy: {},
    totalPeriodCount: 0,
  };

  componentDidMount() {
    const {dispatch} = this.props;
    if (!this.props.gradeList || !this.props.gradeList.length) {
      dispatch({
        type: ManagesGrade + '/list',
        payload: {s: 10000}
      });
    }
  }

  next() {
    const current = this.state.current + 1;
    this.setState({current});
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({current});
  }

  renderSubjectTeacherMenu = (x, y) => {
    const {subjectConfig = {}, teacherMapOfSubjectId = {}, policy = {}} = this.state;
    const {subjectList = []} = this.props;
    const teacherMap = Object.values(teacherMapOfSubjectId).reduce((map, arr) => {
      return arr.reduce((map, teacher) => {
        map[teacher.id] = teacher;
        return map;
      }, map);
    }, {});
    const subjectMap = subjectList.reduce((map, subject) => {
      map[subject.id] = subject;
      return map;
    }, {});

    return (
      <Menu onClick={({key}) => {
        let [subjectId, teacherId] = key.split('-');
        teacherId = teacherId * 1;
        const {teacherLimit = {}} = policy;

        const t = teacherLimit[teacherId] || {id: teacherId, teacher: teacherMap[teacherId], limit: {}};
        t.limit[[x, y].join('-')] = subjectMap[subjectId];

        teacherLimit[teacherId] = t;

        policy.teacherLimit = teacherLimit;

        this.setState({policy: {...policy}});

      }}>
        {
          Object.entries(subjectConfig).map(([subjectId, config]) => {
            const subject = subjectMap[subjectId];
            if (config.teacherIds) {
              const teachers = config.teacherIds.map(id => teacherMap[id]);
              return (
                <Menu.SubMenu key={subject.id} title={subject.name}>
                  {
                    teachers.map(teacher =>
                      <Menu.Item key={[subject.id, teacher.id].join('-')}>{teacher.name}</Menu.Item>
                    )
                  }
                </Menu.SubMenu>
              )
            }
            return (
              <Menu.Item key={subject.id}>{subject.name}</Menu.Item>
            )
          })
        }
      </Menu>
    )
  };

  save = () => {
    const {periodMap = {}, gradeId, klassIds = [], subjectConfig = {}, policy = {}} = this.state;
    const payload = {gradeId};

    payload.klassIds = klassIds.map(it => it * 1);

    payload.subjectConfig = Object.values(subjectConfig).map(({subjectId, count, teacherIds}) => ({
      id: subjectId,
      count,
      teacherIds
    }));

    payload.periodList = Object.entries(periodMap).reduce((arr, [key, value]) => {
      if (value) {
        arr.push(key.split('-').map(it => it * 1));
      }
      return arr;
    }, []);

    payload.policy = {};

    const {teacherLimit} = policy;

    if (teacherLimit) {
      payload.policy.teacherLimit = Object.values(teacherLimit).map(({id, limit}) => ({
        id,
        limit: Object.keys(limit).map(key => key.split('-').map(k => k * 1))
      }));
    }

    const {dispatch} = this.props;

    dispatch({
      type: namespace + '/create',
      payload,
      resolve: (res) => {
        console.log(res);
        message.success('创建成功');
      },
      reject: (ex) => {
        console.error(ex);
        message.error('创建失败：' + ex.message);
      }
    });
  };

  render() {

    const {
      loading, dispatch, location,
      gradeList = [], klassList = [], subjectList = [],
    } = this.props;

    const {pathname, query} = location;

    const subjectMap = subjectList ? subjectList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {}) : {};

    const {klassIds,current, gradeId, periodMap = {}, teacherMapOfSubjectId = {}, subjectConfig = {}} = this.state;

    const title = '创建行政班排课方案';

    const breadcrumb = ['排课', '行政班排课管理', title];

    const buttons = [
      {
        key: 'save',
        type: 'primary',
        children: '保存',
        title: '保存',
        icon: 'save',
        onClick: () => {

        },
      },
      {
        key: 'rollback'
      }
    ];


    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    const wrapper = {
      // wrapperCol: {span: 18},
      // labelCol: {span: 6}
    };

    console.log(this.state);

    const resetProps = {
      gradeId,
      klassIds,
      dispatch,
      gradeList,
      klassList,
      subjectList,
      subjectConfig,
      teacherMapOfSubjectId,
      onChange: state=>this.setState(state),
    };

    const steps = [
      {
        title: '选择年级/班级',
        content: () => (
          <Step1  {...resetProps}  />
        ),
      },
      {
        title: '选择科目/教师/课时数量',
        content: () => (
          <Fragment>

            {
              gradeId && subjectList && subjectList.length ?
                <StepContentBox title="每周每班每科目上课课时" >
                  <div className={styles['subject-config-table']}>

                    <Row className={styles['subject-row']}>
                      <Col span={4}><Checkbox onChange={e => {
                        if (e.target.checked) {
                          subjectList.map(subject => {
                            subjectConfig[subject.id] = {subjectId: subject.id, subjectName: subject.name};
                            if (!teacherMapOfSubjectId[subject.id]) {
                              dispatch({
                                type: ManagesTeacher + '/list',
                                payload: {
                                  subjectId: subject.id,
                                  gradeId: this.state.gradeId,
                                  s: 10000
                                },
                                resolve: ({list = []} = {}) => {
                                  teacherMapOfSubjectId[subject.id] = list;
                                  this.setState({
                                    teacherMapOfSubjectId: {...teacherMapOfSubjectId}
                                  });
                                },
                              })
                            }
                          });
                          this.setState({subjectConfig: {...subjectConfig}});
                        } else {
                          this.setState({
                            subjectConfig: {},
                          });
                        }
                      }}>科目</Checkbox></Col>
                      <Col span={4}>课时</Col>
                      <Col span={16}><Checkbox onChange={e => {
                        if (e.target.checked) {
                          Object.entries(subjectConfig).forEach(([subjectId, config]) => {
                            const teachers = teacherMapOfSubjectId[subjectId] || [];
                            config.teacherIds = teachers.map(it => it.id);
                          });
                        } else {
                          Object.values(subjectConfig).forEach(config => {
                            config.teacherIds = [];
                          });
                        }
                        this.setState({subjectConfig: {...subjectConfig}});
                      }}>参与排课的教师</Checkbox></Col>
                    </Row>

                    {
                      subjectList.map(subject =>
                        <Row className={styles['subject-row']} key={subject.id}>
                          <Col span={4}>

                            <Checkbox checked={!!subjectConfig[subject.id]} value={subject.id} onChange={(e) => {
                              const {subjectConfig = {}} = this.state;
                              if (e.target.checked) {
                                subjectConfig[subject.id] = {subjectId: subject.id, subjectName: subject.name};
                                if (!this.state.teacherMapOfSubjectId[subject.id]) {
                                  dispatch({
                                    type: ManagesTeacher + '/list',
                                    payload: {
                                      subjectId: subject.id,
                                      gradeId: this.state.gradeId,
                                      s: 10000
                                    },
                                    resolve: ({list = []} = {}) => {
                                      this.state.teacherMapOfSubjectId[subject.id] = list;
                                      this.setState({teacherMapOfSubjectId: {...this.state.teacherMapOfSubjectId}});
                                    }
                                  })
                                }
                              } else {
                                delete subjectConfig[subject.id];
                              }
                              this.setState({subjectConfig: {...subjectConfig}});
                            }}>{subject.name}</Checkbox>
                          </Col>
                          <Col span={4}>
                            {
                              subjectConfig[subject.id] ?
                                <InputNumber value={subjectConfig[subject.id].count || 0} min={0} max={54}
                                             onChange={(count) => {
                                               const {subjectConfig = {}} = this.state;
                                               if (!subjectConfig[subject.id]) {
                                                 subjectConfig[subject.id] = {count};
                                               } else {
                                                 subjectConfig[subject.id].count = count;
                                               }

                                               const totalSubjectPeriodCount = Object.values(subjectConfig).reduce((sum, config) => {
                                                 return sum + (config.count || 0)
                                               }, 0);

                                               this.setState({
                                                 subjectConfig: {...subjectConfig},
                                                 totalSubjectPeriodCount
                                               });
                                             }}/>
                                :
                                null
                            }
                          </Col>
                          <Col span={16}>

                            {
                              subjectConfig[subject.id] && teacherMapOfSubjectId[subject.id] ?
                                <div>
                                  <div>
                                    <Checkbox.Group value={subjectConfig[subject.id].teacherIds || []}
                                                    onChange={(teacherIds) => {
                                                      subjectConfig[subject.id].teacherIds = teacherIds;
                                                      this.setState({subjectConfig: {...subjectConfig}});
                                                    }}>
                                      <Row>
                                        {
                                          teacherMapOfSubjectId[subject.id].map(teacher =>
                                            <Col span={6} key={teacher.id}>
                                              <Checkbox value={teacher.id}><span style={{
                                                display: 'inline-block',
                                                width: 80
                                              }}>{teacher.name}</span></Checkbox>
                                            </Col>
                                          )
                                        }
                                      </Row>
                                    </Checkbox.Group>
                                  </div>
                                  {
                                    subjectConfig[subject.id].count && subjectConfig[subject.id].teacherIds && subjectConfig[subject.id].teacherIds.length ?
                                      <div style={{
                                        background: '#f8f8f8',
                                        borderTop: '1px solid #ccc',
                                        padding: '5px 10px',
                                        margin: '10px -10px -5px -10px'
                                      }}>
                                        平均每个老师每周上
                                        {
                                          Math.ceil(this.state.klassIds.length * subjectConfig[subject.id].count / subjectConfig[subject.id].teacherIds.length)
                                        }
                                        节
                                      </div>
                                      :
                                      null
                                  }

                                </div>
                                :
                                null
                            }


                          </Col>
                        </Row>
                      )
                    }
                  </div>
                  {
                    this.state.totalSubjectPeriodCount ?
                      <h3>总科目课时数量：{this.state.totalSubjectPeriodCount}</h3>
                      :
                      null
                  }
                </StepContentBox>
                :
                null
            }
          </Fragment>
        ),
      },
      {
        title: '选择年级每周课时安排',
        content: () => (
          <div style={{width: 800, margin: '0 auto'}}>
            <h2>选择每周课时安排</h2>
            <PeriodEditor editable value={periodMap} onChange={periodMap => {
              const totalWeekPeriodCount = Object.values(periodMap).filter(it => !!it).length;
              this.setState({periodMap, totalWeekPeriodCount})
            }}/>
            {
              this.state.totalSubjectPeriodCount ?
                <h3>总科目课时数量：{this.state.totalSubjectPeriodCount}</h3>
                :
                null
            }
            {
              this.state.totalWeekPeriodCount ?
                <h3>已选择每周课时安排数量：{this.state.totalWeekPeriodCount}</h3>
                :
                null
            }
          </div>
        ),
      },
      {
        title: '选择排课条件策略',
        content: () => (
          <div style={{width: 800, margin: '0 auto'}}>
            <h2>选择排课条件策略</h2>
            {/*<div>*/}
            {/*  <Checkbox><span>同一科目不能在一天内重复</span></Checkbox>*/}
            {/*</div>*/}
            <h3>
              <Checkbox onChange={e => {
                if (e.target.checked) {
                  this.setState({
                    policy: {
                      ...this.state.policy,
                      teacherLimit: {}
                    }
                  });
                } else {
                  if (this.state.policy) {
                    delete this.state.policy.teacherLimit;
                    this.setState({
                      policy: {
                        ...this.state.policy
                      }
                    });
                  }
                }
              }}><span>限制教师不能出现在哪几节课</span></Checkbox>
            </h3>
            {
              this.state.policy.teacherLimit ?
                <div>
                  <PeriodEditor editable={false} value={periodMap} onChange={() => {
                  }}
                                renderItem={
                                  ({x, y, selected}) =>
                                    selected ?
                                      <Dropdown overlay={this.renderSubjectTeacherMenu(x, y)}><a>限制</a></Dropdown>
                                      :
                                      null
                                }
                  />
                  {
                    Object.values(this.state.policy.teacherLimit).map(it =>
                      <Row key={it.id}>
                        <Col span={8}>{it.teacher.name}不能出现在</Col>
                        <Col span={16}>
                          {
                            Object.entries(it.limit).map(([limit, subject]) =>
                              <LimitSubject key={limit + '-' + subject.id} limit={limit} subject={subject}/>
                            )
                          }
                        </Col>
                      </Row>
                    )
                  }
                </div>
                :
                null
            }
          </div>
        ),
      },
      {
        title: '保存生成方案',
        content: '保存生成方案',
      },
    ];


    return (
      <Page header={header} loading={!!loading}>
        <Form layout="vertical" className={styles['create-scheduling-form']}>
          <h1>创建行政班排课方案</h1>
          <div className={styles['steps-header']}>
            <Steps current={current}>
              {
                steps.map(it =>
                  <Steps.Step key={it.title} title={it.title}/>
                )
              }
            </Steps>
          </div>
          <div className={styles['steps-content']}>
            {
              typeof steps[current].content === 'function' ?
                steps[current].content()
                :
                steps[current].content
            }
          </div>
          <div className={styles['steps-action']}>
            {
              current > 0 && (
                <Button style={{marginRight: 30}} size="large" onClick={() => this.prev()}>
                  上一步
                </Button>
              )
            }
            {
              current < steps.length - 1 && (
                <Button size="large" type="primary"
                        onClick={() => {
                          switch (this.state.current) {
                            case 0:
                              if (!this.state.gradeId) {
                                message.error('请先选择年级');
                                return;
                              }
                              if (!this.state.klassIds || !this.state.klassIds.length) {
                                message.error('请先选择班级');
                                return;
                              }
                              break;
                            case 1:
                              if (!this.state.subjectConfig || !Object.keys(this.state.subjectConfig).length) {
                                message.error('请选择科目');
                                return;
                              }
                              if (!this.state.totalSubjectPeriodCount) {
                                message.error('请设置科目课时');
                                return;
                              }
                              break;
                            case 2:
                              break;
                            case 3:
                              break;
                          }
                          console.log(this.state);
                          this.next();
                        }}>
                  下一步
                </Button>
              )
            }
            {
              current === steps.length - 1 && (
                <Button size="large" type="primary" onClick={() => {
                  this.save();
                }}>
                  完成
                </Button>
              )
            }

          </div>
        </Form>
      </Page>
    );
  }

  checkSubject = (subject, checked)=>{
    const {gradeId, subjectConfig={}, teacherMapOfSubjectId={}} = this.state;
    const {dispatch} = this.props;
    if(checked) {
      subjectConfig[subject.id] = {subjectId: subject.id, subjectName: subject.name};
      if(!teacherMapOfSubjectId[subject.id]){
        dispatch({
          type: ManagesTeacher + '/list',
          payload: {
            subjectId:subject.id,
            gradeId,
            s: 10000
          },
          resolve: ({list = []} = {}) => {
            teacherMapOfSubjectId[subject.id] = list;
            this.setState({
              teacherMapOfSubjectId: {...teacherMapOfSubjectId}
            });
          },
        })
      }

    }else{
      delete subjectConfig[subject.id];
    }
    this.setState({subjectConfig:{...subjectConfig}});
  }
}

const WeekList = ['一', '二', '三', '四', '五', '六', '日'];

class PeriodEditor extends Component {

  state = {
    weekList: WeekList,
    numList: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  };

  _refEditor = createRef();

  _refWeekTableEditor = createRef();

  _refCursor = createRef();


  render() {
    const {onChange, value = {}, editable, renderItem = () => null} = this.props;
    const {weekList = [], numList = []} = this.state;
    return (
      <div className={styles['period-editor']} ref={this._refEditor}>
        <div className={styles['week-table-editor']} ref={this._refWeekTableEditor}>
          <table className={classNames(styles['week-table'], {[styles['editable']]: editable})}>
            <thead>
            <tr>
              <th>
                {
                  editable ?
                    <Checkbox onClick={(e) => {
                      if (e.target.checked) {
                        const v = numList.reduce((a, y) => weekList.reduce((a, w, x) => {
                          const k = [x, y].join('-');
                          if (x < 5) {
                            a[k] = true;
                          }
                          return a;
                        }, a), {});
                        onChange && onChange(v);
                      } else {
                        onChange && onChange({});
                      }
                    }}/>
                    :
                    null
                }
              </th>
              {
                weekList.map((it, x) =>
                  <th key={it} onClick={() => {
                    numList.forEach(y => {
                      const key = [x, y].join('-');
                      value[key] = !value[key];
                    });
                    onChange && onChange({...value});
                  }} title={`点击反选星期${it}的课时安排`}>
                    {it}
                  </th>
                )
              }
            </tr>
            </thead>
            <tbody>
            {
              numList.map((y) =>
                <tr key={y}>
                  <th onClick={() => {
                    weekList.forEach((w, x) => {
                      const key = [x, y].join('-');
                      value[key] = !value[key];
                    });
                    onChange && onChange({...value});
                  }} title={`点击反选第${y + 1}节的课时安排`}>{y + 1}</th>
                  {
                    weekList.map((w, x) => {
                        const key = [x, y].join('-');
                        const className = classNames({
                          [styles['selected']]: !!value[key]
                        });

                        return (
                          <td key={key} className={className} onClick={() => {
                            if (editable) {
                              value[key] = !value[key];
                              onChange && onChange(value);
                            }
                          }}>{renderItem({x, y, selected: !!value[key]})}</td>
                        )
                      }
                    )
                  }
                </tr>
              )
            }
            </tbody>
          </table>
        </div>
        {
          editable ?
            <div className="tac" style={{paddingTop: 20}}>
              <Button icon="plus" onClick={() => {
                numList.push(numList[numList.length - 1] + 1);
                this.setState({numList: [...numList]});
              }}>增加每日课时</Button>
              <Button style={{marginLeft: '2em'}} icon="minus" onClick={() => {
                numList.pop();
                this.setState({numList: [...numList]});
              }}>减少每日课时</Button>
            </div>
            :
            null
        }
      </div>
    )
  }
}

function LimitSubject({limit, subject}) {
  const [x, y] = limit.split('-');
  return (
    <div>星期{WeekList[x]}第{y * 1 + 1}节{subject.name}</div>
  )
}

function StepContentBox({title, children}) {
  return (
    <div className={styles['step-content-box']}>
      <h2>{title}</h2>
      <div className={styles['step-content-box-body']}>
        {children}
      </div>
    </div>
  )
}

function Step1({gradeId, klassIds, dispatch, gradeList = [], klassList = [], onChange}) {

  const onGradeChange = gradeId => {
    onChange && onChange({gradeId});
    dispatch({
      type: ManagesClass + '/list',
      payload: {
        s: 10000,
        gradeId,
        type: 1,
      }
    });
    dispatch({
      type: ManagesSubject + '/list',
      payload: {
        s: 10000,
        gradeId
      }
    });
  };

  return (
    <Fragment>
      <StepContentBox title="请选择年级">
        {
          gradeList && gradeList.length ?
            <Select value={gradeId} style={{width: 200}} onChange={onGradeChange}>
              {
                gradeList.map(it =>
                  <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                )
              }
            </Select>
            :
            null
        }
      </StepContentBox>
      {
        gradeId && klassList && klassList.length ?
          <Step1SelectKlass klassIds={klassIds} onChange={onChange} klassList={klassList}/>
          :
          null
      }

    </Fragment>
  )
}

function Step1SelectKlass({klassIds, onChange, klassList}) {
  const onKlassChange = klassIds => onChange && onChange({klassIds});
  return (
    <StepContentBox title={
      <Fragment>
        <span>请选择班级</span>
        <span style={{float: 'right'}}>
                <Checkbox onChange={e => {
                  if (e.target.checked) {
                    onChange && onChange({klassIds: klassList.map(it => it.id + '')});
                  } else {
                    onChange && onChange({klassIds: []});
                  }
                }}>全选</Checkbox>
              </span>
      </Fragment>
    }>
      <Checkbox.Group value={klassIds || []} onChange={onKlassChange}>
        <Row className={styles['checkbox-group-row-col']}>
          {
            klassList.map(it =>
              <Col span={6} key={it.id}>
                <Checkbox value={it.id + ''}>{it.name}</Checkbox>
              </Col>
            )
          }

        </Row>
      </Checkbox.Group>
    </StepContentBox>
  )
}
