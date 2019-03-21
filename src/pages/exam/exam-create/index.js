
import React from 'react'
import { connect } from 'dva';
import { Steps, Button } from 'antd';
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import styles from './index.less'
import StepOne from './components/StepOne'
import StepTwo from './components/StepTwo'
import StepThree from './components/StepThree'
import { ManagesGrade, ExamCreate } from '../../../utils/namespace';
import { ManagesSteps } from './utils/namespace';

const steps = [
  { title: '确定考试信息', description: '确定年级、科目、考场等信息' },
  { title: '选择考试时间', description: '选择监考老师、确定考试时间' },
  { title: '配置考场信息', description: '分配考场、考生、监考' }
];
const StepItem = Steps.Step
@connect(state => ({
  gradeList: state[ManagesGrade].list,
  item: state[ExamCreate].item,
  updateOne: state[ManagesSteps].updateOne,
  updateTwo: state[ManagesSteps].updateTwo,
  loading: state[ManagesSteps].loading
}))
export default class ExamCreatePage extends React.Component {

  state = {
    current: 0,
  }

  onNext() {
    const current = this.state.current;
    if (current === 0) {
      const nextUpdateOne = this.props.updateOne + 1
      this.props.dispatch({
        type: ManagesSteps + '/updateOne',
        payload: {
          updateOne: nextUpdateOne
        }
      })
    } else if (current === 1) {
      const nextUpdateTwo = this.props.updateTwo + 1
      this.props.dispatch({
        type: ManagesSteps + '/updateTwo',
        payload: {
          updateTwo: nextUpdateTwo
        }
      })
    }
  }

  prev() {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  // 校验成功下一步
  onCheckSuccess = () => {
    console.log('onCheckSuccess')
    const nextCurrent = this.state.current + 1;
    this.setState({ current: nextCurrent });
  }

  render() {
    const title = '创建考务';
    const breadcrumb = ['考务管理', '创建考务'];
    const headerOperation = <PageHeaderOperation buttons={[{ key: 'rollback' }]} />;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation} />
    );
    const { current } = this.state;
    const stepLimitNum = 2;
    const { loading } = this.props;

    return (
      <Page loading={loading}
        header={header}>
        <div className={styles["steps"]}>
          <Steps current={current}>
            {
              steps.map(item =>
                <StepItem key={item.title} title={item.title} description={item.description} />)
            }
          </Steps>
        </div>
        <div className={styles["steps-content"]}>
          {
            current === 0
            && <StepOne onCheckSuccess={this.onCheckSuccess} />
          }
          {
            current === 1
            && <StepTwo onCheckSuccess={this.onCheckSuccess} />
          }
          {
            current === 2
            && <StepThree />
          }
        </div>
        <div className={styles["steps-action-bottom"]}>
          <div className={styles["steps-action-line"]} />
          <div className={styles["steps-action"]}>
            {
              current > 0 &&
              <Button
                size='large'
                style={{ marginRight: 30 }}
                onClick={() => this.prev()}
              >上一步</Button>
            }
            {
              current < stepLimitNum &&
              <Button
                size='large'
                disabled={false}
                style={{ marginRight: 30 }}
                type="primary"
                onClick={() => { this.onNext() }}
              >下一步</Button>
            }
            {/* {
              current === stepLimitNum &&
              <Button
                size='large'
                type="primary"
                onClick={() => this.submit()}
              >提交</Button>
            } */}
          </div>
        </div>
      </Page>
    )
  }
}