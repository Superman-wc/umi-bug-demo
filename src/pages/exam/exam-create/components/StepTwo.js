import React from 'react'
import { connect } from 'dva';
import { Form, Radio, DatePicker, Select, Checkbox, Row, Col } from 'antd';
import { ExamCreate } from '../../../../utils/namespace'
import { ManagesSteps } from '../utils/namespace'
import { GradeIndexEnum, Enums } from '../../../../utils/Enum';

const FormItem = Form.Item
const RadioGroup = Radio.Group;
const RangePicker = DatePicker.RangePicker;
const CheckboxGroup = Checkbox.Group
// teachersByGradeIndex
// var res = moment(Date.now(), 'YYYY-MM-DD HH:mm:ss').valueOf();
@connect(state => ({
  teacherList: state[ExamCreate].teacherList,
  twoItem: state[ManagesSteps].twoItem,
  updateTwo: state[ManagesSteps].updateTwo,
  subjectSelectList: state[ManagesSteps].subjectSelectList,
}))
@Form.create({
  mapPropsToFields(props) {
    const twoItem = props.twoItem || {};
    const { gradeTeacherIndex, teacherIds } = twoItem;
    const { subjectSelectList = [] } = props;
    const subjectFields = {};
    subjectSelectList.forEach(it => {
      subjectFields[`subjectDate${it.id}`] =
        Form.createFormField({ value: twoItem[`subjectDate${it.id}`] || undefined });
    })
    return {
      ...subjectFields,
      gradeTeacherIndex: Form.createFormField({ value: gradeTeacherIndex || undefined }),
      teacherIds: Form.createFormField({ value: teacherIds || undefined }),
    }
  },
  onValuesChange(props, values) {
    // console.log('onValuesChange: ', values)
    const { form: { getFieldsValue }, dispatch } = props
    const twoItem = getFieldsValue()
    dispatch({
      type: ManagesSteps + '/saveTwoItem',
      payload: {
        twoItem: { ...twoItem, ...values }
      }
    })
  }
})
export default class StepTwo extends React.Component {

  // state = {
  //   checkDate: true
  // }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.updateTwo && nextProps.updateTwo !== this.props.updateTwo) {
      console.log('update: updateTwo: ', nextProps.updateTwo);
      const { form: { getFieldsValue, validateFieldsAndScroll }, onCheckSuccess } = this.props
      const item = getFieldsValue()
      // console.log('getFieldsValue: ', item);
      validateFieldsAndScroll((errors, payload) => {
        if (errors) {
          console.error(errors);
        } else {
          const { subjectSelectList, dispatch } = this.props;
          const dateSelectList = [];
          subjectSelectList.forEach(it => {
            it.dateList = item[`subjectDate${it.id}`];
            dateSelectList.push(it);
          });

          dispatch({
            type: ManagesSteps + '/saveDateSelectList',
            payload: {
              dateSelectList
            }
          });

          onCheckSuccess();
        }
      })
    }
  }

  onGradeDataChange = (e) => {
    const { dispatch } = this.props;
    dispatch({
      type: ManagesSteps + '/setLoading',
      payload: {
        loading: true
      }
    });
    dispatch({
      type: ExamCreate + '/teachersByGradeIndex',
      payload: {
        gradeIndex: e.target.value
      },
      resolve: () => {
        dispatch({
          type: ManagesSteps + '/setLoading',
          payload: {
            loading: false
          }
        });
      },
    })
  }

  handleSubjectDate = (id, name, rule, value, callback) => {
    // this.setState({
    //   checkDate: true
    // })
    // console.log('id-name: ', id, name, value);
    if (value && id && name) {
      const { subjectSelectList, form: { getFieldsValue } } = this.props;
      const start = value[0].valueOf();
      const end = value[1].valueOf();
      subjectSelectList.forEach(it => {
        if (it.id !== id) {
          const item = getFieldsValue()[`subjectDate${it.id}`]
          if (item) {
            const items = [item[0].valueOf(), item[1].valueOf()];
            const checkStart = start > items[0] && start < items[1];
            const checkEnd = end > items[0] && end < items[1];
            if (checkStart || checkEnd) {
              // console.log(`${name}考试时间与${it.name}考试时间重叠`);
              callback(`${name}考试时间与${it.name}考试时间重叠`);
              return;
            }
          }
        }
      });
    }
    callback();
  }

  render() {
    const {
      teacherList = [], subjectSelectList = [],
      form: { getFieldDecorator }
    } = this.props;

    const formlayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 21 },
    }

    return (
      <div>
        <Form {...formlayout} layout='horizontal'>
          {
            subjectSelectList.map(it =>
              <FormItem key={it.id} label={`${it.name}考试时间`} >
                {
                  getFieldDecorator(`subjectDate${it.id}`, {
                    rules: [
                      { message: `请选择${it.name}考试时间`, required: true },
                      { validator: this.handleSubjectDate.bind(null, it.id, it.name) }
                    ]
                  })
                    (
                      <RangePicker
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        placeholder={['考试开始时间', '考试结束时间']}
                      />
                    )
                }

              </FormItem>
            )
          }
          <FormItem label="监考老师年级">
            {
              getFieldDecorator('gradeTeacherIndex', {
                rules: [{ message: '请选择年级', required: true }],
              })(
                <RadioGroup onChange={this.onGradeDataChange}>
                  {
                    Enums(GradeIndexEnum).map(it =>
                      <Radio.Button key={it.value} value={it.value}>{it.name}</Radio.Button>
                    )
                  }
                </RadioGroup>
              )
            }
          </FormItem>
          <FormItem label='选择监考老师'>
            {
              getFieldDecorator('teacherIds', {
                rules: [{ message: '请选择监考老师', required: true }]
              })
                (
                  <CheckboxGroup>
                    <Row>
                      {
                        teacherList.map(it =>
                          <Col key={it.id} span={4} style={{ height: 40 }}>
                            <Checkbox value={it.id}>{it.name}</Checkbox>
                          </Col>
                        )
                      }
                    </Row>
                  </CheckboxGroup>
                )
            }
          </FormItem>
        </Form>
        <div style={{ height: 80 }}></div>
      </div>
    )
  }
}