import { connect } from 'dva';
import { Steps } from 'antd'
import { ManagesSteps } from '../utils/namespace'

const StepItem = Steps.Step

function StepsClass({ dispatch, current = 0 }) {

  const steps = [
    { title: '确定考试信息', description: '确定年级、科目、考场等信息' },
    { title: '选择考试时间', description: '选择监考老师、确定考试时间' },
    { title: '配置考场信息', description: '分配考场、考生、监考' }
  ];
  return (
    <Steps current={current}>
      {
        steps.map(item =>
          <StepItem key={item.title} title={item.title} description={item.description} />)
      }
    </Steps>
  )
}

export default connect(state => ({
  current: state[ManagesSteps].current || 0
}))(StepsClass)