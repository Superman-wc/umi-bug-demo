import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {Progress, Empty, Button, message, Alert, Spin} from 'antd';
import {Authenticate, ExaminerMarking as namespace} from "../../../utils/namespace";
import PageHeaderOperation from "../../../components/Page/HeaderOperation";
import Page from "../../../components/Page";
import classNames from 'classnames';
import styles from './$id.less';
import Keyboard from 'keyboardjs';
import router from "umi/router";
import {analyze} from "../../../services/examiner/sheet";


const MOUNTED = Symbol('MarkingPage#Mounted');

@connect(state => ({
  authenticate: state[Authenticate].authenticate,
  item: state[namespace].item,
  loading: state[namespace].loading,
  studentList: state[namespace].student,
}))
export default class MarkingPage extends Component {

  static CID = 0;

  state = {};

  studentViewListId = 'student-list-' + MarkingPage.CID++;


  componentDidMount() {

    this[MOUNTED] = true;

    this.bindKeyboard();

    const {dispatch, query, match: {params: {id}}} = this.props;
    if (id) {
      this.loadQuestion(id);
    }
  }

  componentWillUnmount() {
    this.unBindKeyboard();
    delete this[MOUNTED];
  }

  keyMap = {
    'enter': e => {
      e.stopPropagation();
      e.preventDefault();
      this.submit();
    },
    'tab': e => {
      e.stopPropagation();
      e.preventDefault();
      this.nextQuestion();
    },
    'space': e => {
      e.stopPropagation();
      e.preventDefault();
      this.prevQuestion();
    }

  };

  bindKeyboard = () => {
    Object.entries(this.keyMap).forEach(([key, fn]) => {
      Keyboard.bind(key, fn);
    });
  };

  unBindKeyboard = () => {
    Object.entries(this.keyMap).forEach(([key, fn]) => {
      Keyboard.unbind(key, fn);
    });
  };

  safeSetState(state, cb) {
    this[MOUNTED] && this.setState(state, cb);
  }

  submit = () => {
    const {dispatch, item} = this.props;
    const {score} = this.state;
    if(score === null || score==='' || typeof score === 'undefined') {
      this.setMessage('请先设置分数', 'error');
    }else{
      dispatch({
        type: namespace + '/marking',
        payload: {
          id: item && item.id,
          score
        },
        resolve: () => {
          analyze({ids: item.sheetId});
          this.setMessage('设置分数成功，正在为你加载下一题...');
          // clearTimeout(this._set_score_success_sid);
          // this._set_score_success_sid = setTimeout(() => {
          this.nextQuestion();
          // }, 100)

        },
        reject: ex => {
          this.setMessage('设置分数失败：' + ex.message, 'error');
        }
      })

    }
  };

  setMessage = (message, type = 'success') => {
    this.safeSetState({
      alert: {message, type}
    });
  };

  loadQuestion = (id, studentId, questionNum) => {
    const {dispatch, location: {query}} = this.props;
    if(!this._load_question_ing) {
      this._load_question_ing = true;
      dispatch({
        type: namespace + '/item',
        payload: {
          id, studentId, questionNum
        },
        resolve: res => {
          this.setState({score: res.score});
          this.loadStudentList(id, res.questionNum, query.auditStatus);
          delete this._load_question_ing;
        },
        reject: ex => {
          message.error('出错了：' + ex.message);
          delete this._load_question_ing;
        }
      })
    }else{
      message.warning('正在加载, 请稍等');
    }
  };

  loadStudentList = (id, questionNum, auditStatus) => {
    const {dispatch} = this.props;
    dispatch({
      type: namespace + '/student',
      payload: {
        id,
        questionNum,
        auditStatus
      },
      // resolve: console.log
    })
  };

  nextQuestion = () => {
    // clearTimeout(this._set_score_success_sid);
    this.safeSetState({alert: null});
    const {item, studentList, match: {params: {id}}} = this.props;

    if (item && studentList && studentList.list && studentList.list.length) {
      let index = studentList.list.findIndex(it => it.studentCode === item.studentCode);
      if (index >= 0) {
        index += 1;
        if (index >= studentList.list.length) {
          index = 0;
        }
        const student = studentList.list[index]; //下一个学生
        if (student) {
          this.loadQuestion(id, student.studentId, item.questionNum);
        } else {
          this.setMessage('已经没有学生了', 'warning');
        }
      } else {
        this.setMessage('找不到学生', 'warning');
      }
    } else {
      this.setMessage('没有学生', 'warning');
    }

  };

  prevQuestion = () => {
    // clearTimeout(this._set_score_success_sid);
    this.safeSetState({alert: null});
    const {item, studentList, match: {params: {id}}} = this.props;

    if (item && studentList && studentList.list && studentList.list.length) {
      let index = studentList.list.findIndex(it => it.studentCode === item.studentCode);
      if (index >= 0) {
        index -= 1;
        if (index < 0) {
          index = studentList.list.length - 1;
        }
        const student = studentList.list[index]; //上一个学生
        if (student) {
          this.loadQuestion(id, student.studentId, item.questionNum);
        } else {
          this.setMessage('已经没有学生了', 'warning');
        }
      } else {
        this.setMessage('找不到学生', 'warning');
      }
    } else {
      this.setMessage('没有学生', 'warning');
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const studentViewList = document.getElementById(this.studentViewListId);
    if (studentViewList && studentViewList.scrollTo) {
      const currentStudent = studentViewList.querySelector('.' + styles['current']);
      if (currentStudent) {
        const y = currentStudent.dataset.y * 1;

        const bottom = studentViewList.scrollTop + studentViewList.clientHeight;
        const top = studentViewList.scrollTop;

        if (y < top) {
          studentViewList.scrollTo(0, y)
        } else if (y + 33 > bottom) {
          studentViewList.scrollTo(0, y - studentViewList.clientHeight + 33);
        }
        // console.log(y, y + 33, top, bottom);

      }
    }

  }

  render() {

    const {dispatch, loading, item, studentList, location, match: {params: {id}}} = this.props;

    const {query, pathname} = location;


    const title = '在线批阅：' + (item ? item.title : '');

    const breadcrumb = item ? [
      item.gradeName,
      item.subjectName,
      '试卷数:' + item.uploadCount,
      <div className={styles['total-progress']}>
        <label>批改进度:</label>
        <Progress percent={Math.round(item.totalProgress * 100)}
                  status={item.totalProgress === 1 ? 'success' : 'active'}/>
      </div>
    ] : ['电子阅卷', '在线批阅'];

    const buttons = [
      {key: 'rollback'}
    ];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;

    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    const pageProps = {
      // header,
      location,
      // loading: !!loading,
      className: styles['marking-page']
    };

    return (
      <Page {...pageProps} >

        <div className={classNames(styles['panel'], styles['editor-panel'])}>
          <h3 className={styles['panel-title']}>题目</h3>
          {
            item && item.progressList ?
              <ul className={styles['question-progress-list']}>
                {
                  item.progressList.map(it =>
                    <QuestionProgress key={[it.editorId, it.questionNum].join('-')}
                                      item={it} current={item}
                                      onClick={() => {
                                        this.loadQuestion(id, item && item.studentId, it.questionNum);
                                      }}
                    />
                  )
                }
              </ul>
              :
              <Empty style={{marginTop: 50}}/>
          }
          <section style={{marginTop: 50}}>
            <div className={styles['alert-box']}>
              {
                this.state.alert && <Alert {...this.state.alert} showIcon/>
              }

            </div>
            <Spin spinning={!!loading}>
              <footer>

                <div className={styles['score-box']}>
                  <label>
                    评分: (输入分数并回车)
                    <input autoFocus
                           type="number"
                           min={0}
                           max={100}
                           placeholder="请输入分数"
                           value={(isNaN(this.state.score) ? '' : this.state.score) || ''}
                           onChange={(e) => {
                             const score = e.target.value; //.replace(/[^\d]/g, '');
                             this.setState({score});
                           }}
                    />
                  </label>
                </div>
                <div className={styles['submit-box']}>
                  <a onClick={this.nextQuestion}>跳过(Tab)</a>
                  <a onClick={this.prevQuestion} style={{marginLeft: '2em'}}>回屏(Space)</a>
                  <Button type="primary" onClick={this.submit}>提交(Enter)</Button>
                </div>
              </footer>

            </Spin>
          </section>
        </div>
        <div className={classNames(styles['panel'], styles['question-panel'])}>
          <h3 className={[styles['panel-title'], styles['total-progress']].join(' ')}
              style={{width: '100%', alignItems: 'center'}}>
            <span style={{margin: '0 2em'}}>正在批改第{item && item.questionNum}题</span>
            {/*<span style={{marginLeft: 30}}>*/}
            {/*  <span>当前：{item && item.studentName}</span>*/}
            {/*  <span>{item && item.unitName}</span>*/}
            {/*  <span>{item && item.studentCode}</span>*/}
            {/*</span>*/}
            {
              item ?
                <Fragment>
                  <label>批改进度:</label>
                  <Progress style={{width: 200}} percent={Math.round(item.totalProgress * 100)}
                            status={item.totalProgress === 1 ? 'success' : 'active'}/>
                </Fragment>
                :
                null
            }
          </h3>
          <section>
            <main>


              {
                item && item.url &&
                <img src={item.url} title="点击图片，大图查看" className={styles['question-image']} onClick={() => {
                  window.open(item.url);
                }}/>
              }
            </main>

          </section>
        </div>
        <div className={classNames(styles['panel'], styles['student-panel'])}>
          <h3 className={styles['panel-title']}>试卷列表</h3>
          <div className={styles['tabs']}>
            {
              [{key: 0, name: '全部'}, {key: 1, name: '未评分'}].map(it =>
                <a key={it.key}
                   className={(query.auditStatus || '0') * 1 === it.key ? styles['selected'] : ''}
                   onClick={() => {
                     router.replace({pathname, query: {...query, auditStatus: it.key || undefined}});
                     this.loadStudentList(id, item && item.questionNum, it.key || undefined);
                   }}
                >
                  {it.name}
                </a>
              )
            }
          </div>
          <ul style={{overflow: 'auto'}} id={this.studentViewListId}>
            {
              studentList && studentList.list && studentList.list.length ?
                studentList.list.map((it, index) =>
                  <StudentItem key={[it.studentId, it.editorId].join('-')}
                               index={index}
                               student={it} item={item}
                               onClick={() => {
                                 this.loadQuestion(id, it.studentId, item && item.questionNum);
                               }}
                  />
                )
                :
                <Empty style={{marginTop: 50}}/>
            }
          </ul>
        </div>

      </Page>
    );
  }
}

function StudentItem({student, item, onClick, index}) {
  return (
    <li className={classNames({
      [styles['current']]: item && (student.studentCode === item.studentCode)
    })}
        onClick={onClick}
        data-y={index * 33}
    >
      <span>{index + 1}</span>
      <span>{typeof student.score === 'number' ? student.score : '未评分'}</span>
    </li>
  )
}


function QuestionProgress({item, current, onClick}) {
  return (
    <li className={classNames({
      [styles['current']]: current && (item.questionNum === current.questionNum)
    })}
        onClick={onClick}
    >
      <span className={styles['question-num']}>第{item.questionNum}题</span>
      <Progress showInfo percent={Math.round(item.progress * 100)} status={item.progress === 1 ? 'success' : 'active'}/>
    </li>
  )
}
