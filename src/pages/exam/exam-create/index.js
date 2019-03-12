
import React from 'react'
import { connect } from 'dva';
import { Form, Cascader, Row, Col, message, Modal, Select, Input, notification, Spin, Button } from 'antd';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import StepsClass from './components/StepsClass'
import { ManagesSteps } from './utils/namespace'
import styles from './index.less'

@connect(state => ({
  current: state[ManagesSteps].current || 0
}))
export default class ExamCreate extends React.Component {

  state = {}

  componentDidMount() {

  }

  onNext = () => {
    let current = this.props.current + 1
    if (current == 3) {
      current = 0;
    }
    console.log('current:', current)
    this.props.dispatch({
      type: ManagesSteps + '/changeStep',
      payload: {
        current: current
      }
    })
  }

  render() {
    const title = '创建考务';
    const breadcrumb = ['考务管理', '创建考务'];
    // const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={[{ key: 'rollback' }]} />;
    const headerOperation = <PageHeaderOperation buttons={[{ key: 'rollback' }]} />;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation} />
    );
    const { current } = this.props
    return (
      <Page
        header={header}>
        <div className={styles['steps']}>
          <StepsClass current={current}></StepsClass>
        </div>

        <Button className={styles['next']} type='primary' onClick={this.onNext}>next</Button>
      </Page>
    )
  }
}