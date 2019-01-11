import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, notification, Checkbox, Button, Card, Table, Radio} from 'antd';
import {
  Authenticate,
  ManagesDashboard as namespace,
  ManagesTeacher,
  ManagesSemester,
  ManagesRoom,
  ManagesLectureArrangePlan,
  ManagesStudentArrangePlan
} from '../../../utils/namespace';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import styles from './index.less';
import {stdColumns} from '../../../components/ListPage';
import {GradeIndexEnum, BuildingTypeEnum, Enums} from '../../../utils/Enum';
import router from 'umi/router';
import classNames from 'classnames';


@connect(state => ({
  profile: state[Authenticate].authenticate || {},
  semester: state[namespace].semester,
  student: state[namespace].student,
  teacher: state[namespace].teacher,
  teacherCount: state[namespace].teacherCount,
  building: state[namespace].building,
  timetable: state[namespace].timetable,
  electionExamination: state[namespace].electionExamination,
  activatedPlan: state[namespace].activatedPlan,
  loading: state[namespace].loading,
}))
export default class DashboardPage extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, location: {query}} = this.props;


    dispatch({
      type: namespace + '/semester',
    });
    dispatch({
      type: namespace + '/student',
      payload: {
        ...query
      }
    });
    dispatch({
      type: namespace + '/teacher',
      payload: {
        ...query
      }
    });
    dispatch({
      type: namespace + '/building',
      payload: {
        ...query
      }
    });
    dispatch({
      type: namespace + '/timetable',
      payload: {
        ...query
      }
    });
    dispatch({
      type: namespace + '/electionExamination',
      payload: {
        ...query
      }
    });

    dispatch({
      type: namespace + '/activatedPlan',
      payload: {
        ...query
      }
    });
    // dispatch({
    //   type: namespace + '/studentArrangePlan',
    //   payload: {
    //     ...query
    //   }
    // })

  }

  render() {
    const {
      loading, location, dispatch,
      profile,
      semester, student, teacher, teacherCount, building, timetable, electionExamination,
      activatedPlan
    } = this.props;

    const {pathname, query} = location;

    const gradeIndex = query.gradeIndex || GradeIndexEnum.高一.toString();

    const gradeIndex2 = query.gradeIndex2 || GradeIndexEnum.高一.toString();

    const gradeIndex3 = query.gradeIndex3 || GradeIndexEnum.高一.toString();

    const buildingType = query.buildingType || BuildingTypeEnum.教学区.toString();

    const schoolName = profile && profile.schoolName || '';

    const title = schoolName + '数据概览';

    const breadcrumb = ['选班排课', '数据概览'];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={[]}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    console.log(activatedPlan);

    return (
      <Page header={header} mainClassName={styles['dashboard-page']}
            location={location}
      >
        <Row>
          <Col span={12} style={{paddingRight: 5}}>
            <SemesterCard semester={semester} loading={!semester}/>
            <ElectionExaminationCard
              electionExamination={electionExamination} loading={!electionExamination}
              value={gradeIndex2}
              onChange={e => {
                router.replace({pathname, query: {...query, gradeIndex2: e.target.value}});
                dispatch({
                  type: namespace + '/electionExamination',
                  payload: {
                    ...query,
                    gradeIndex2: e.target.value
                  }
                });
              }}
            />
            <ActivatedPlanCard
              activatedPlan={activatedPlan} loading={!activatedPlan}
              value={gradeIndex3}
              onChange={e => {
                router.replace({pathname, query: {...query, gradeIndex3: e.target.value}});
                dispatch({
                  type: namespace + '/activatedPlan',
                  payload: {
                    ...query,
                    gradeIndex3: e.target.value
                  }
                });
              }}
            />

          </Col>
          <Col span={12} style={{paddingLeft: 5}}>
            <StudentCard student={student} value={gradeIndex} loading={!student} onChange={e => {
              router.replace({pathname, query: {...query, gradeIndex: e.target.value}});
              dispatch({
                type: namespace + '/student',
                payload: {...query, gradeIndex: e.target.value}
              });
            }}/>
            <TeacherCard teacher={teacher} loading={!teacher} teacherCount={teacherCount}/>
            <BuildingCard onChange={e => {
              router.replace({pathname, query: {...query, buildingType: e.target.value}});
              dispatch({
                type: namespace + '/building',
                payload: {
                  buildingType: e.target.value
                }
              });
            }} building={building} loading={!building} value={buildingType}/>
            <TimetableCard timetable={timetable} loading={!timetable}/>
          </Col>
        </Row>

      </Page>
    );
  }
}

function SemesterCard({semester, loading}) {
  return (
    <Card className={styles['current-semester']}
          title="当前学期" loading={loading}
          extra={<a onClick={() => router.push(ManagesSemester)}>修改</a>}>
      {semester && semester.academicYear}学年第{semester && semester.semesterType}学期
    </Card>
  )
}

function ElectionExaminationCard({electionExamination, loading, value, onChange}) {
  return (
    <Card className={styles['election-examination']} title="选科数据" style={{marginTop: 10}}
          loading={loading}
          extra={
            <Radio.Group value={value} onChange={onChange}>
              {
                Enums(GradeIndexEnum).map(it =>
                  <Radio.Button key={it.value} value={it.value}>{it.name}</Radio.Button>
                )
              }
            </Radio.Group>
          }
    >
      <h3>已选人数：{electionExamination && electionExamination.studentSize}人</h3>
      <Row>
        <Col span={12}>
          <h3>选考</h3>
          <ul className={styles['election-examination-list']}>
            {
              electionExamination && electionExamination.studentStatisticVM && electionExamination.studentStatisticVM.length ?
                electionExamination.studentStatisticVM.map(it =>
                  <li key={it.subjectName}>{it.subjectName}：{it.electionExaminationNum}</li>
                )
                :
                null
            }
          </ul>
        </Col>
        <Col span={12}>
          <h3>学考</h3>
          <ul className={styles['election-examination-list']}>
            {
              electionExamination && electionExamination.studentStatisticVM && electionExamination.studentStatisticVM.length ?
                electionExamination.studentStatisticVM.map(it =>
                  <li key={it.subjectName}>{it.subjectName}：{it.studyExaminationNum}</li>
                )
                :
                null
            }
          </ul>
        </Col>
      </Row>
      <h3>选考组合</h3>
      <ul className={styles['election-examination-list']}>
        {
          electionExamination && electionExamination.electionExaminationCombinationVM && electionExamination.electionExaminationCombinationVM.length ?
            electionExamination.electionExaminationCombinationVM.map(it =>
              <li key={it.combinationName}>{it.combinationName}：{it.combinationNum}</li>
            )
            :
            null
        }
      </ul>
    </Card>
  )
}

function ActivatedPlanCard({activatedPlan, loading, value, onChange}) {

  const {electionExaminationPlan = {}, studyExaminationPlan = {}, lecturePlan = {}} = activatedPlan || {};

  return (
    <Card className={classNames(styles['card-header-not-top-border'], styles['activated-plan'])}
          title="分班排课" style={{marginTop: -10}}
          loading={loading}
          extra={
            <Radio.Group value={value} onChange={onChange}>
              {
                Enums(GradeIndexEnum).map(it =>
                  <Radio.Button key={it.value} value={it.value}>{it.name}</Radio.Button>
                )
              }
            </Radio.Group>
          }
    >
      <h3>
        当前分班方案
        <a style={{float: 'right'}}
           onClick={() => router.push({pathname: ManagesStudentArrangePlan})}>
          查看更多
        </a>
      </h3>
      <Row>
        <Col span={12}>
          <h4>选考方案：{electionExaminationPlan && electionExaminationPlan.name || '无'}</h4>
          {
            electionExaminationPlan && electionExaminationPlan.courseKlassVMList && electionExaminationPlan.courseKlassVMList.length ?
              <ul>
                {
                  electionExaminationPlan.courseKlassVMList.map(it =>
                    <li key={it.courseId}>
                      <label style={{width:60, textAlign:'right', display:'inline-block'}}>{it.courseName}：</label>
                      <span>{it.klassNum}个班</span>
                    </li>
                  )
                }
              </ul>
              :
              null
          }
        </Col>
        <Col span={12}>
          <h4>学考方案：{studyExaminationPlan && studyExaminationPlan.name || '无'}</h4>
          {
            studyExaminationPlan && studyExaminationPlan.courseKlassVMList && studyExaminationPlan.courseKlassVMList.length ?
              <ul>
                {
                  studyExaminationPlan.courseKlassVMList.map(it =>
                    <li key={it.courseId}>
                      <label style={{width:60, textAlign:'right', display:'inline-block'}}>{it.courseName}：</label>
                      <span>{it.klassNum}个班</span>
                    </li>
                  )
                }
              </ul>
              :
              null
          }
        </Col>
      </Row>
      <h3>当前排课方案</h3>
      <h4>
        {lecturePlan && lecturePlan.name || '无'}
        <a style={{float: 'right'}}
           onClick={() => router.push({pathname: ManagesLectureArrangePlan + '/' + lecturePlan.id})}>
          打开方案管理
        </a>
      </h4>
    </Card>
  )
}

function StudentCard({value, onChange, student, loading}) {
  return (
    <Card title="学生数据" loading={loading}
          extra={
            <Radio.Group value={value} onChange={onChange}>
              {
                Enums(GradeIndexEnum).map(it =>
                  <Radio.Button key={it.value} value={it.value}>{it.name}</Radio.Button>
                )
              }
            </Radio.Group>
          }
    >
      <Table pagination={false} className="list-table" size="small"
             rowKey="klassName"
             columns={stdColumns([
               {title: '班级', key: 'klassName'},
               {title: '教室', key: 'roomName'},
               {title: '班主任', key: 'teacherName'},
               {title: '学生数量', key: 'studentNum'},
             ])}
             dataSource={Array.isArray(student) ? student : []}
      />
    </Card>
  )
}

function TeacherCard({teacher, loading, teacherCount}) {
  return (
    <Card className={styles['card-header-not-top-border']} title="师资数据" style={{marginTop: -10}}
          loading={loading}
          extra={<a onClick={() => router.push(ManagesTeacher)}>管理</a>}
    >
      <h3>可教学人数：{teacherCount}人</h3>
      <ul className={styles['teacher-list']}>
        {
          teacher && teacher.map(it =>
            <li key={it.subjectId}>{it.subjectName}：{it.count}人</li>
          )
        }
      </ul>
    </Card>
  )
}

function BuildingCard({value, building, loading, onChange}) {
  return (
    <Card title="场地资源" style={{marginTop: 10}} loading={loading}
          extra={
            <Fragment>
              <Radio.Group value={value} onChange={onChange}>
                {
                  Enums(BuildingTypeEnum).map(it =>
                    <Radio.Button key={it.value} value={it.value}>{it.name}</Radio.Button>
                  )
                }
              </Radio.Group>
              <a style={{marginLeft: '1em'}} onClick={() => router.push(ManagesRoom)}>管理</a>
            </Fragment>
          }
    >
      <Table pagination={false} className="list-table" size="small"
             rowKey="name"
             columns={stdColumns([
               {title: '名称', key: 'name'},
               {title: '楼层数', key: 'floorNum'},
               {title: '房间数', key: 'roomNum'},
               {title: '总容量', key: 'capacity'},
             ])}
             dataSource={Array.isArray(building) ? building : []}
      />
    </Card>
  );
}

function TimetableCard({timetable, loading}) {
  return (
    <Card title="教学计划" style={{marginTop: 10}} loading={loading}
          extra={<a>管理</a>}
    >
      <Table pagination={false} className="list-table" size="small"
             rowKey="grade"
             columns={stdColumns([
               {title: '名称', key: 'grade', render: (v, row) => v + row.semester},
               {title: '日节次', key: 'numInDay'},
               {title: '总课时', key: 'numInWeek'},
             ])}
             dataSource={Array.isArray(timetable) ? timetable : []}
      />

    </Card>
  )
}
