import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, notification, Checkbox, Button, Card} from 'antd';
import {Authenticate, ManagesSemester, ManagesGrade} from '../../utils/namespace';
import Page from '../../components/Page';
import PageHeaderOperation from '../../components/Page/HeaderOperation';
import styles from './index.less';
import Flex from '../../components/Flex';
import Editor from '../../components/AnswerCardEditor';

@connect(state => ({
  currentSemester: (list => list.find(it => it.currentType === 1))(state[ManagesSemester].list || []),
  semesterList: state[ManagesSemester].list || [],
  profile: state[Authenticate].authenticate || {},
  gradeList: (state[ManagesGrade].list || []).sort((a, b) => a.id - b.id),
}))
export default class DashboardPage extends Component {

  state = {};

  componentDidMount() {
    const {dispatch} = this.props;


  }

  render() {
    const {
      loading, location, dispatch,
      currentSemester, profile, gradeList,
    } = this.props;

    const schoolName = profile && profile.schoolName || '';

    const title = schoolName + '答题卡设计';

    const breadcrumb = ['电子阅卷', '答题卡设计'];


    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={[]}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );


    return (
      <Page header={header} mainClassName={styles['marking-page']}
            location={location}
            loading={!!loading}
      >
       <Editor />
      </Page>
    );
  }
}






function StudentInfoBox() {
  return (
    <div className={styles['student-info-box']}>
      <div className={styles['student-info-header']}>
        <label>班级：</label>
        <label>姓名：</label>
      </div>
      <StudentCodeBox code={'2017'} length={8}/>
    </div>
  )
}

function NumberArea({value}) {
  const ret = [];
  for (let i = 0; i < 10; i++) {
    ret.push(
      <DaubRectangleBox key={i} checked={i + '' === value} value={i}/>
    )
  }
  return ret;
}


function DaubRectangleBox({checked, value}) {
  return (
    <div data-checked={checked} className={styles['daub-rectangle-box']}>
      <div>{value}</div>
    </div>
  )
}

class StudentCodeBox extends Component {

  state = {
    code: '',
    length: 8
  };

  componentDidMount() {
    const {code, length = 8} = this.props;
    this.setState({code, length});
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.code !== this.props.code || nextProps.length !== this.props.length) {
      this.setState({code: nextProps.code, length: nextProps.length});
    }
  }


  render() {
    const {focus, code, length = 8} = this.state;
    const codes = code.split('');
    for (let i = 0, len = length - codes.length; i < len; i++) {
      codes.push('');
    }
    return (
      <label className={[styles['student-code-box'], focus ? styles['focus'] : ''].join(' ')}>
        <input maxLength={length} value={code}
               onChange={(e) => {
                 this.setState({code: e.target.value.replace(/[^\d]/g, '')});
               }}
               onFocus={() => {
                 this.setState({focus: true});
               }}
               onBlur={() => {
                 this.setState({focus: false});
               }}
        />
        {
          codes.map((value, key) =>
            <div key={key} className={styles['student-code-col']}>
              <div className={styles['student-code-value']}>{value}</div>
              <NumberArea value={value}/>
            </div>
          )
        }

      </label>
    )
  }
}
