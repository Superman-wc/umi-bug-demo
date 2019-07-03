import React, {Component} from 'react';
import {connect} from 'dva';
import {Tabs, Steps} from 'antd';
import Page from '../../components/Page';
import PageHeaderOperation from '../../components/Page/HeaderOperation';
import {Link} from 'umi';
import styles from './index.less';

@connect(state => ({}))
export default class TimetablePage extends Component {
  render() {

    const {dispatch} = this.props;

    const title = '排课概览';
    const breadcrumb = ['排课', title];
    const buttons = [
      {
        key: 'rollback'
      }
    ];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    return (
      <Page header={header}>
        <div style={{padding: 20, width:800, margin:'0 auto'}}>
          <div style={{height:50}}/>
          <Tabs>
            <Tabs.TabPane key="dependencies" tab="依赖基础数据">
              <div className={styles['tabs-content']}>
                <p className={styles['desc']}>排课需要涉及以下依赖基础数据，在进行排课前请先处理这些数据。</p>
                <p className={styles['dependencies']}>
                  {
                    [
                      {title: '年级管理', link: '/manages/grade'},
                      {title: '班级管理', link: '/manages/class'},
                      {title: '科目管理', link: '/manages/subject'},
                      {title: '教师管理', link: '/manages/teacher'},
                      {title: '学期管理', link: '/manages/semester'},
                    ].map(({title, link}) =>
                      <Link key={link} to={link}>{title}</Link>
                    )
                  }
                </p>
              </div>
            </Tabs.TabPane>
          </Tabs>
          <div style={{height:50}}/>
          <Tabs>
            <Tabs.TabPane key="flowPath" tab="排课工作流程">
              <div className={styles['tabs-content']}>
                <Steps direction="vertical">
                  <Steps.Step title={<Link to="/manages/scheduling/create">第一步, 创建在线排课方案</Link>}
                              description={
                                <div>
                                  <p>在线排课，选择排课的年级、班级、科目、课时、教师、每周上课时间，排课策略，自动生成排课方案</p>
                                  <Link to="/manages/scheduling/create">在线排课&gt;&gt;&gt;</Link>
                                </div>
                              }
                  />
                  <Steps.Step title={<Link to="/manages/lecture-arrange-plan">第二步，发布排课方案</Link>}
                              description={
                                <div>
                                  <p>预览生成的排课方案，确认师资分班情况、年级课表， 发布排课方案，使课表进入”构建课表”中</p>
                                  <Link to="/manages/lecture-arrange-plan">发布排课方案&gt;&gt;&gt;</Link>
                                </div>
                              }
                  />
                  <Steps.Step title={<Link to="/timetable/build">第三步，构建课表</Link>}
                              description={
                                <div>
                                  <p>可以对排课方案生成的年级课表进行进一步的细节调整，以更符合学校的教学工作安排</p>
                                  <Link to="/timetable/build">构建课表&gt;&gt;&gt;</Link>
                                </div>
                              }
                  />
                  <Steps.Step title={<Link to="/timetable/build">第四步，导入到学期课表</Link>}
                              description={
                                <div>
                                  <p>对已经调整过的课表应用到指定的学期中，生成“年级课表”、“教师课表”、“班级课表”、“学生课表”</p>
                                  <Link to="/timetable/build">导入到学期课表&gt;&gt;&gt;</Link>
                                </div>
                              }
                  />
                  <Steps.Step
                    title={
                      <span className={styles['step-title']}>
                      第五步，日常课表使用中的
                      <Link to="/timetable/class">取消课程</Link>、
                      <Link to="/timetable/class">换课</Link>、
                      <Link to="/timetable/teacher">代课</Link>
                    </span>
                    }
                    description={
                      <div>
                        <p>日常工作中，涉及到的针对班级取消课程、换课在班级课表中处理，教师换课在教师课表中处理</p>
                        <Link to="/timetable/class">取消课程&gt;&gt;&gt;</Link>
                        <Link to="/timetable/class" style={{margin:'0 2em'}}>换课&gt;&gt;&gt;</Link>
                        <Link to="/timetable/teacher">代课&gt;&gt;&gt;</Link>
                      </div>
                    }
                  />
                </Steps>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Page>
    )
  }
}
