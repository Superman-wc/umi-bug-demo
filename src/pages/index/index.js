import React from 'react';
import {connect} from 'dva';
import {Timeline, Button} from 'antd';
import Page from '../../components/Page';
import {Authenticate} from "../../utils/namespace";
import styles from './index.less';

export default connect()(function Home({dispatch}) {

  const headerProps = {
    breadcrumb: ['系统更新日志'],
    title: '欢迎使用布谷科技智慧校园系统',
    operation: (
      <Button onClick={() => {
        dispatch({
          type: Authenticate + '/logout'
        })
      }}>退出</Button>
    )
  };
  const header = <Page.Header {...headerProps}/>;

  //把下面的注释去除就会出现了
  //console.log(a+b);

  return (
    <Page header={header}>
      <div className={styles.home}>
        <Timeline>
          <Timeline.Item>
            <h3>2017-12 Version:1.1.0</h3>
            <p>
              1. 功能实现：电子阅卷、答题卡设计、成绩分析等<br/>
              2. 功能实现：文印管理
            </p>

          </Timeline.Item>
          <Timeline.Item>
            <h3>2017-12 Version:1.0.0</h3>
            <p>
              1. 功能实现：学期管理、年级管理、科目管理、班级管理、学生管理、师资管理<br/>
              2. 功能实现：课程管理、教室管理、课表配置、课时配置、设备管理
            </p>

          </Timeline.Item>
          <Timeline.Item>
            <h3>2017-10-25 课表全新UI</h3>
            <p>
              1. 功能实现：课表全新UI<br/>
              2. 功能实现：新的交互方式<br/>
              3. 功能实现：用户权限（登录部分）<br/>
            </p>
          </Timeline.Item>
          <Timeline.Item>
            <h3>2017-10-15 二期功能</h3>
            <p>
              1. 功能实现：代课<br/>
              2. 功能实现：换课<br/>
              3. 功能实现：取消课程<br/>
            </p>
          </Timeline.Item>
          <Timeline.Item>
            <h3>2017-10-01 一期功能</h3>
            <p>
              1. 功能实现：年级课表<br/>
              2. 功能实现：班级课表<br/>
              3. 功能实现：教师课表<br/>
              4. 功能实现：学生课表<br/>
            </p>
          </Timeline.Item>
        </Timeline>
      </div>
    </Page>

  );
});
