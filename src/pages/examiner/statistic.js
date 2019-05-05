import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import classNames from 'classnames';
import {Tabs,} from 'antd';
import {ExaminerSheet as namespace} from '../../utils/namespace';
import Page from '../../components/Page';
import PageHeaderOperation from '../../components/Page/HeaderOperation';
import styles from "./workspace.less";


@connect(state => ({
  list: state[namespace].statistic,
  loading: state[namespace].loading,
}))
export default class StatisticPage extends Component {


  componentDidMount() {
    const {dispatch, location: {query}} = this.props;
    dispatch({
      type: namespace + '/statistic',
      payload: {
        ...query
      }
    });
  }

  render() {
    const {
      loading, location, dispatch, list = [],
    } = this.props;

    const {query, pathname} = location;

    const title = '答题卡上传统计';

    const breadcrumb = ['管理', '电子阅卷', title];

    const buttons = [
      {
        key: 'rollback'
      }
    ];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    const pageProps = {
      header, location, loading: !!loading
    };

    return (
      <Page {...pageProps} >
        <Tabs>
          {
            list.map(klass =>
              <Tabs.TabPane
                key={klass.id}
                tab={klass.name}
              >
                <div style={{padding:10}}>
                <h3>
                  {klass.name}共{klass.students.length}人,
                  每份答题卡为{query.pageCount}张,
                  需收集{klass.students.length * query.pageCount}张,
                  {/*目前处理{klass.taskMap && klass.taskMap[editor.id] && klass.taskMap[editor.id].length || 0}张*/}
                </h3>
                <ul className={styles['class-student-list']}>
                  {
                    klass.students.map(student =>
                      <Student key={student.id} {...student}/>
                    )
                  }
                </ul>
                </div>
              </Tabs.TabPane>
            )
          }
        </Tabs>
      </Page>
    )
  }
}

function Student({id, name, code, avatar, submit}) {
  return (
    <li className={classNames({
          [styles['sheet']]: submit
        })}
    >
      <span>
        <img src={avatar + '!t'} width={30}/>
      </span>
      <div>
        <div>{name}({code})</div>
        <div>{submit ? '已上传' : '未上传'}</div>
      </div>

    </li>
  )
}
