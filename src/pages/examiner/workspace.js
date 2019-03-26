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
import {pipes, flowLine} from "../../utils/pipe";
import styles from './workspace.less';
import {create as createSheet, analyze} from '../../services/examiner/sheet';
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

                      return createSheet(opt).then(({result}) => {
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
        <DragUploader token={authenticate.token}>
          {
            editorTitle ?
              <h2 className={styles['editor-title']}>{editorTitle}</h2>
              :
              null
          }


        </DragUploader>
      </Page>
    )
  }
}

class DragUploader extends Component {
  state = {
    tasks: [],
  };

  handleDragOver = e => e.preventDefault();

  handleDragEnter = e => {
    e.preventDefault();
    this.setState({drag: true});
  };

  handleDragLeave = e => {
    e.preventDefault();
    this.setState({drag: false});
  };

  handleDrop = e => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length) {
      this.handleTask(e.dataTransfer.files);
    }
  };

  handleTask = files => {
    const uploadTasks = this.buildTaskList(files);
    let {tasks = [], waitUploadCount = 0} = this.state;

    waitUploadCount += uploadTasks.length;
    tasks = uploadTasks.concat(tasks);

    console.log(tasks, uploadTasks);

    this.refreshTasksState({
      drag: false,
      tasks,
      waitUploadCount,
    }).then(() => {
      setTimeout(() => {
        // 开始流水线任务
        this.startFlowLine(uploadTasks).then(list => {
          console.log('上传并创建完成', list);
          const ids = [];
          const sheetMap = list.filter(it => it && it.sheet).reduce((map, it) => {
            map[it.sheet.id] = it;
            ids.push(it.sheet.id);
            return map;
          }, {});
          const run = (ids, waitTime = 2000) => {
            return new Promise((resolve, reject) => {
              clearTimeout(this.analyze_sid);
              this.analyze_sid = setTimeout(() => {
                analyze({ids: ids.join(',')}).then(({result: {list = []}} = {}) => {
                  console.log('解析完成：', list);
                  let state = {};
                  const ids = [];
                  list.forEach(it => {
                    const task = sheetMap[it.id];
                    if (task) {
                      state = {...this.analyzeSheet(task, it)};
                    }
                    if (it.status === ExaminerStatusEnum.等待处理 || it.status === ExaminerStatusEnum.处理中) {
                      ids.push(it.id);
                    }
                  });
                  return this.refreshTasksState(state).then(() => {
                    if (ids && ids.length) {
                      run(ids);
                    }
                  });

                }).then(resolve, reject);
              }, waitTime);

            })
          };

          if (ids && ids.length) {
            run(ids, 15000);
          }

        });
      }, 1000);

    });
  };

  startFlowLine = (tasks) => {
    return flowLine([
      this.upload,
      this.buildSheet,
    ], tasks);
  };

  refreshTasksState = (state = {}) => {
    return new Promise(
      resolve => this.setState({
          tasks: [...this.state.tasks],
          ...state,
        },
        resolve
      )
    );
  };

  getQiniuyun = () => {
    if (!this.qiniuyun) {
      this.qiniuyun = new Qiniuyun(buildQiniuConfig(this.props.token));
    }
    return this.qiniuyun;
  };

  upload = (task) => {
    if (task && task.file) {
      return this.getQiniuyun().upload(task, {
        onStart: () => {
          task.status = '开始上传';
          task.progress = {
            status: 'normal',
            percent: 0,
          };
          this.refreshTasksState();
        },
        onProgress: (percent) => {
          task.status = '正在上传';
          task.progress = {
            status: 'active',
            percent: Math.floor(percent / 3)
          };
          this.refreshTasksState();
        },
        onEnd: () => {
          task.status = '上传结束';
          task.progress = {
            status: 'active',
            percent: 34,
          };
          delete task.file;
          this.refreshTasksState();
        },
        onError: (err) => {
          task.error = err;
          task.status = '上传出错';
          task.progress = {
            status: 'exception',
            percent: task.progress.percent,
          };
          this.refreshTasksState();
        },
      }).then(({url}) => {
        task.url = url;
        task.status = '正在识别';
        task.progress = {
          status: 'active',
          percent: 34,
        };
        delete task.error;
        return this.refreshTasksState();
      }).catch(ex => {
        task.error = ex;
        task.status = '上传出错';
        task.progress = {
          status: 'exception',
          percent: 34,
        };
        return this.refreshTasksState();
      })
    }
    return Promise.resolve();
  };

  analyzeSheet = (task, sheet) => {
    const state = {};

    switch (sheet.status) {
      case ExaminerStatusEnum.删了:
        task.error = new Error('答题卡被删除了');
        task.status = '识别失败';
        task.progress = {
          status: 'exception',
          percent: 67,
        };
        break;
      case ExaminerStatusEnum.等待处理:
      case ExaminerStatusEnum.处理中:
        task.sheet = sheet;
        task.status = '正在解析';
        task.progress = {
          status: 'active',
          percent: 67,
        };
        delete task.error;
        break;
      case ExaminerStatusEnum.完成:
        task.sheet = sheet;
        task.status = '解析完成';
        task.progress = {
          status: 'success',
          percent: 100,
        };
        if (!this.state.editorId) {
          state.editorId = sheet.editorId;
          state.editorTitle = sheet.editorTitle;
          state.subjectId = sheet.subjectId;
          state.gradeId = sheet.gradeId;
          delete task.error;
        } else if (this.state.editorId !== sheet.editorId) {
          task.error = new Error('不相同的答题卡');
        }
        break;
      case ExaminerStatusEnum.处理错误:
        task.error = new Error(sheet.lastErrorMsg);
        task.status = '识别失败';
        task.progress = {
          status: 'exception',
          percent: 67,
        };
        break;
    }

    return state;
  };

  buildSheet = (task) => {
    if (task && task.url) {
      return createSheet(task).then(({result}) => {

        const state = this.analyzeSheet(task, result);

        return this.refreshTasksState(state)

      }).catch(ex => {

        task.error = ex;
        task.status = '识别失败';
        task.progress = {
          status: 'exception',
          percent: 67,
        };
        return this.refreshTasksState();

      });
    }
    return Promise.resolve();
  };

  /**
   * 构建任务队列
   * @param files
   * @returns {Array}
   */
  buildTaskList = files => {
    const tasks = [];
    for (let i = 0, len = files.length; i < len; i++) {
      const file = files[i];
      if (/image/i.test(file.type)) {
        tasks.push(this.createTask(file));
      }
    }
    tasks.sort((a, b) => a.lastModified - b.lastModified);
    return tasks;
  };

  /**
   * 创建一个任务对象
   * @param file
   * @returns {{file: *, filename: string, name: *, status: string}}
   */
  createTask = file => {
    return {
      file,
      filename: buildFileName(file),
      status: '等待上传',
      name: file.name,
    };
  };


  render() {

    // console.log(this.state);

    const style = {
      flex: 1,
      border: this.state.drag ? '10px dashed #08f' : '10px dashed transparent',
      backgroundColor: this.state.drag ? 'rgba(0, 128, 255, 0.3)' : 'transparent',
    };

    const {tasks = []} = this.state;

    console.log('tasks=', tasks);

    return (
      <div style={style}
           onDrop={this.handleDrop}
           onDragOver={this.handleDragOver}
           onDragEnter={this.handleDragEnter}
           onDragLeave={this.handleDragLeave}
      >
        {this.props.children}
        {
          tasks && tasks.length ?
            <TaskList tasks={tasks}/>
            :
            <DragTips/>
        }
      </div>
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
           title={data.url ? '查看图片' : null}
           onClick={() => {
             data.url && window.open(data.url + '!page');
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

