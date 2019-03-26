import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {message, Progress, Button} from 'antd';
import Uploader from '../../components/Uploader';
import {Authenticate} from "../../utils/namespace";
import {QiniuDomain, QiniuUpToken} from "../../services";
import Flex from '../../components/Flex';
import {ExaminerSheet as namespace} from '../../utils/namespace';
import ListPage from '../../components/ListPage'
import TableCellOperation from '../../components/TableCellOperation';
import {ExaminerStatusEnum} from '../../utils/Enum';
import Page from '../../components/Page';
import PageHeaderOperation from '../../components/Page/HeaderOperation';
import {buildFileName} from "../../components/AnswerEditor/Uploader";
import {buildQiniuConfig} from '../../services'
import Qiniuyun from "../../utils/Qiniuyun";
import {pipes, pipe} from "../../utils/pipe";
import styles from './workspace.less';
import {create, analyze} from '../../services/examiner/sheet';
import classNames from 'classnames';


@connect(state => ({
  authenticate: state[Authenticate].authenticate,
  list: state[namespace].list,
  loading: state[namespace].loading,
}))
export default class WorkspacePage extends Component {

  state = {};

  componentWillMount() {

  }

  render() {
    const {
      list, total, loading, location, dispatch, authenticate,
    } = this.props;

    const {
      tasks = [],
      waitUploadCount = 0,
      waitCreateCount = 0,
      waitAnalyzeCount = 0,
      editorTitle,
    } = this.state;

    console.log(this.state);

    const title = '答题卡阅卷工作区';

    const breadcrumb = ['管理', '电子阅卷', title];

    const buttons = [];


    const uploaderProps = {
      onDrop: (e) => {
        e.preventDefault();


        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          let count = 0;
          const tasks = [];
          const waitList = [];
          for (let i = 0, len = e.dataTransfer.files.length; i < len; i++) {
            const file = e.dataTransfer.files[i];
            if (/image/i.test(file.type)) {
              const task = {
                index: count++,
                file,
                filename: buildFileName(file),
                status: '等待上传',
                name: file.name,
              };
              tasks.push(task);
              waitList.push(task);

            }
          }

          waitList.sort((a, b) => a.lastModified - b.lastModified);

          console.log(tasks);

          if (this.state.tasks && this.state.tasks.length) {
            for (let i = 0, len = this.state.tasks.length; i < len; i++) {
              const task = this.state.tasks[i];
              task.index = count + i;
              tasks.push(task);
            }
          }

          const {waitUploadCount = 0, waitCreateCount = 0, waitAnalyzeCount = 0} = this.state;

          this.setState({
            drag: false,
            tasks,
            waitUploadCount: waitUploadCount + count,
            waitCreateCount: waitCreateCount + count,
            waitAnalyzeCount: waitAnalyzeCount + count,
          }, () => {

            if (waitList.length) {
              const qiniuyun = new Qiniuyun(buildQiniuConfig(authenticate.token));
              pipes(
                opt =>
                  qiniuyun.upload(opt, {
                    onStart: () => {
                      opt.status = '开始上传';
                      opt.progress = {
                        status: 'normal',
                        percent: 0,
                      };
                      this.setState({tasks: [...this.state.tasks]});
                    },
                    onProgress: (percent) => {
                      opt.status = '正在上传';
                      opt.progress = {
                        status: 'active',
                        percent: Math.floor(percent / 3)
                      };
                      this.setState({tasks: [...this.state.tasks]});
                    },
                    onEnd: () => {
                      opt.status = '上传结束';
                      opt.progress = {
                        status: 'active',
                        percent: 34,
                      };
                      delete opt.file;
                      this.setState({
                        tasks: [...this.state.tasks],
                        waitUploadCount: this.state.waitUploadCount - 1
                      });
                    },
                    onError: (err) => {
                      opt.error = err;
                      opt.status = '上传出错';
                      opt.progress = {
                        status: 'exception',
                        percent: opt.progress.percent,
                      };
                      this.setState({
                        tasks: [...this.state.tasks],
                        // waitUploadCount: this.state.waitUploadCount - 1
                      });
                    },
                  }).then(
                    ({url}) => {
                      opt.url = url;
                      opt.status = '正在识别';
                      opt.progress = {
                        status: 'active',
                        percent: 34,
                      };
                      this.setState({
                        tasks: [...this.state.tasks],
                      });

                      return create(opt).then(({result}) => {
                        if (result.status === ExaminerStatusEnum.处理错误) {
                          opt.error = new Error(result.lastErrorMsg);
                          opt.status = '识别失败';
                          opt.progress = {
                            status: 'exception',
                            percent: 67,
                          };
                          this.setState({
                            tasks: [...this.state.tasks],
                          });
                        } else {
                          opt.sheet = result;
                          opt.status = '正在解析';
                          opt.progress = {
                            status: 'active',
                            percent: 67,
                          };
                          const state = {
                            tasks: [...this.state.tasks],
                            waitCreateCount: this.state.waitCreateCount - 1,
                          };
                          if (!this.state.editorId) {
                            state.editorId = result.editorId;
                            state.editorTitle = result.editorTitle;
                            state.subjectId = result.subjectId;
                            state.gradeId = result.gradeId;
                          } else if (this.state.editorId !== result.editorId) {
                            opt.error = new Error('不相同的答题卡');
                          }
                          this.setState(state);
                          return opt;
                        }


                      }).catch((ex) => {
                        opt.error = ex;
                        opt.status = '识别失败';
                        opt.progress = {
                          status: 'exception',
                          percent: 67,
                        };
                        this.setState({
                          tasks: [...this.state.tasks],
                        });
                      });
                    }
                  ).catch(
                    ex => {
                      opt.error = ex;
                      opt.status = '出错';
                      opt.progress = {
                        status: 'exception',
                        percent: opt.progress.percent,
                      };
                      this.setState({tasks: [...this.state.tasks]});
                    }
                  ),
              )(...waitList).then((res) => {
                const ids = [];
                const optMap = res.filter(it => it && !!it.sheet).reduce((map, it) => {
                  ids.push(it.sheet.id);
                  map[it.sheet.id] = it;
                  return map;
                }, {});

                if (ids.length) {

                  return new Promise((resolve, reject) => {
                    setTimeout(() => {
                      analyze({ids: ids.join(',')}).then(({result: {list = []}}) => {
                        let waitAnalyzeCount = this.state.waitAnalyzeCount;
                        list.forEach(it => {
                          const opt = optMap[it.id];
                          if (opt) {

                            if (it.status === ExaminerStatusEnum.处理错误) {
                              opt.error = new Error(it.lastErrorMsg);
                              opt.status = '解析失败';
                              opt.progress = {
                                status: 'exception',
                                percent: 67,
                              };
                            } else {

                              opt.sheet = it;
                              opt.status = '解析成功';
                              opt.progress = {
                                status: 'success',
                                percent: 100,
                              };
                              waitAnalyzeCount--;
                            }
                          }
                        });
                        this.setState({
                          tasks: [...this.state.tasks],
                          waitAnalyzeCount,
                        });
                        resolve();

                      }).catch((ex) => {
                        reject(ex);
                      });
                    }, 15000);

                  });
                }
                return Promise.resolve(res);

              })
            }
          });

        }


      },
      onDragOver: e => e.preventDefault(),
      onDragEnter: (e) => {
        e.preventDefault();
        this.setState({drag: true});
      },
      onDragLeave: e => {
        e.preventDefault();
        this.setState({drag: false});
      },
      style: {
        flex: 1,
        border: this.state.drag ? '10px dashed #08f' : '10px dashed transparent',
        backgroundColor: this.state.drag ? 'rgba(0, 128, 255, 0.3)' : 'transparent',
      }
    };

    const totalProgress = tasks.length ? (tasks.length * 3 - waitUploadCount - waitCreateCount - waitAnalyzeCount) / (tasks.length * 3) : 0;


    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}>
        <div>
          <h3>
            <span>共{tasks.length}张，</span>
            <span>待上传{waitUploadCount}张，</span>
            <span>待创建{waitCreateCount}张，</span>
            <span>待解析{waitAnalyzeCount}张，</span>
          </h3>
          {
            totalProgress ?
              <Progress value={totalProgress}/>
              :
              null
          }
        </div>
      </Page.Header>
    );

    const pageProps = {
      header, location, loading: !!loading,
      className: styles['workspace']
    };


    return (
      <Page {...pageProps} >
        <div {...uploaderProps}>
          {
            editorTitle ?
              <h2 className={styles['editor-title']}>{editorTitle}</h2>
              :
              null
          }

          {
            tasks && tasks.length ?
              <TaskList tasks={tasks}/>
              :
              <DragTips/>
          }

        </div>
      </Page>
    )
  }
}


function TaskList({tasks}) {
  return (
    <ul className={styles['task-list']}>
      {

        tasks.map((it) =>
          <Task key={it.filename} data={it}/>
        )
      }
    </ul>
  )
}

function Task(props) {
  const {data} = props;
  return (
    <li key={data.filename}>
      <div className={styles['name']}
           title={data.url?'查看图片':null}
           onClick={() => {
             data.url && window.open(data.url+'!page');
           }}
      >
        {data.name}
      </div>
      {
        data.sheet ?
          <Fragment>
            <div>
              班级：{data.sheet.unitId}
            </div>
            <div>
              学生：{data.sheet.studentCode}
            </div>
          </Fragment>

          :
          null
      }
      <div className={styles['progress']}>
        <Progress {...data.progress}/>
      </div>

      <div className={classNames(styles['status'], {
        [styles['error']]: data.error,
      })} title={data.error ? data.error.message : null}>
        {data.status}{data.error ? ':' + data.error.message : null}
      </div>
    </li>
  )
}

function DragTips() {
  return (
    <div className={styles['drag-tips']}>
      <span>请将答题卡扫描图片<br/>拖放到此处</span>
    </div>
  )
}
