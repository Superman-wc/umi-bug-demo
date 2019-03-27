import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {message, Progress} from 'antd';
import {Authenticate} from "../../utils/namespace";
import {ExaminerSheet as namespace, ManagesClass, ManagesStudent} from '../../utils/namespace';
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
import router from 'umi/router';
import {toArray, copyFields} from "../../utils/helper";


@connect(state => ({
  authenticate: state[Authenticate].authenticate,
  list: state[namespace].list,
  loading: state[namespace].loading,
}))
export default class WorkspacePage extends Component {

  state = {};

  ref = React.createRef();

  render() {
    const {
      loading, location, dispatch, authenticate,
    } = this.props;

    const title = '答题卡阅卷工作区';

    const breadcrumb = ['管理', '电子阅卷', title];

    const buttons = [
      {
        key: '查看历史上传记录',
        children: '查看历史上传记录',
        type: 'primary',
        onClick: () => {
          router.push({pathname: '/examiner/upload'})
        }
      },
      {
        key: '清理工作区',
        children: '清理工作区',
        onClick: () => {
          this.ref.current.clear();
        }
      }
    ];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={buttons}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    const pageProps = {
      header, location, loading: !!loading,
      className: styles['workspace']
    };

    return (
      <Page {...pageProps} >
        <DragUploader ref={this.ref} dispatch={dispatch} token={authenticate.token}/>
      </Page>
    )
  }
}


class DragUploader extends Component {

  state = {
    tasks: [],
  };

  clear = () => {
    const state = Object.keys(this.state).reduce((map, key) => {
      map[key] = undefined;
      return map;
    }, {});
    this.setState(state);
  };

  componentDidMount() {
    document.addEventListener('drop', this.handleDrop, false);
    document.addEventListener('dragover', this.handleDragOver, false);
    // document.addEventListener('dragenter', this.handleDragEnter, false);
    // document.addEventListener('dragleave', this.handleDragLeave, false);
    // document.addEventListener('dragstart', this.handleDragEnter, false);
    // document.addEventListener('dragend', this.handleDragLeave, false);
  }

  componentWillUnmount() {
    document.removeEventListener('drop', this.handleDrop);
    document.removeEventListener('dragover', this.handleDragOver);
    // document.removeEventListener('dragenter', this.handleDragEnter);
    // document.removeEventListener('dragleave', this.handleDragLeave);
    // document.removeEventListener('dragstart', this.handleDragEnter, false);
    // document.removeEventListener('dragend', this.handleDragLeave, false);

  }

  handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({drag: true});
  };

  handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({drag: false});
  };

  handleDrop = e => {

    e.preventDefault();
    e.stopPropagation();

    let {items, files} = e.dataTransfer;

    const readDirectory = directory => new Promise((resolve, reject) => directory.createReader().readEntries(resolve, reject));

    const entryToFile = entry => new Promise((resolve, reject) => entry.file(file => {
      file.fullPath = entry.fullPath.replace(/^\//g, '');
      resolve(file);
    }, reject));

    const scanFiles = entry => {
      if (entry.isDirectory) {
        return readDirectory(entry).then(entries => pipes(scanFiles)(...entries))
      } else if (entry.isFile) {
        return entryToFile(entry).then(file => ([file]));
      }
      return Promise.resolve([]);
    };

    pipes(
      scanFiles
    )(
      ...(
        toArray(items).filter(
          it => it.kind === 'file'
        ).map(
          it => it.webkitGetAsEntry()
        ).filter(
          it => !!it
        )
      )
    ).then(
      this.handleTask
    ).catch(
      ex => {
        message.error('出错了：' + ex.message)
      }
    );


    // if (e.dataTransfer.files && e.dataTransfer.files.length) {
    //   this.handleTask(e.dataTransfer.files);
    // }
  };


  /**
   * 将文件处理成任务，并开启流水线处理任务
   * @param files
   */
  handleTask = files => {
    const uploadTasks = this.buildTaskList(files);
    let {tasks = [], waitUploadCount = 0} = this.state;

    waitUploadCount += uploadTasks.length;
    tasks = uploadTasks.concat(tasks);

    this.refreshTasksState({
      drag: false,
      tasks,
      waitUploadCount,
    }).then(() => {
      setTimeout(() => {
        // 开始流水线任务
        this.startFlowLine(uploadTasks)
      }, 300);

    });
  };

  loadClass = id => {
    return new Promise((resolve, reject) => {
      const {dispatch} = this.props;
      dispatch({
        type: ManagesClass + '/item',
        payload: {id},
        resolve,
        reject
      })
    });
  };

  loadStudent = klassId => {
    return new Promise((resolve, reject) => {
      const {dispatch} = this.props;
      dispatch({
        type: ManagesStudent + '/list',
        payload: {
          klassId,
          simple: 1,
          s: 100,
        },
        resolve,
        reject
      })
    })
  };

  loadClassStudent = (klassId) => {
    if (this._loading_class_student !== klassId) {
      this._loading_class_student = klassId;
      Promise.all([
        this.loadClass(klassId),
        this.loadStudent(klassId),
      ]).then(([klass, {list}]) => {
        if (klass && list && list.length) {
          let {classMap = {}, studentMap = {}} = this.state;
          const unit = copyFields(klass, ['id', 'name', 'gradeId', 'gradeName']);
          unit.students = [];
          studentMap = list.reduce((map, it) => {
            const student = copyFields(it, ['id', 'name', 'code', 'avatar', 'klassId', 'klassName', 'gradeId', 'gradeName']);
            unit.students.push(student);
            map[it.id] = student;
            return map;
          }, studentMap);
          classMap[klassId] = unit;
          this.setState({classMap: {...classMap}, studentMap: {...studentMap}});
        }
      })
    }
  };

  /**
   * 检查缺少的学生
   */
  checkLackClassStudent = () => {
    const {tasks = [], classMap = {}} = this.state;
    if (tasks.length) {
      const task = tasks[0];

    }

  };


  /**
   * 开始流水线工作
   * @param tasks
   * @returns {Promise<T|never>}
   */
  startFlowLine = (tasks) => {
    return flowLine([
      this.upload,  // 上传图片
      this.buildSheet,  // 构建答题卡记录
    ], tasks).then(
      list => {
        console.log('上传并创建完成', list);
        const ids = [];
        const sheetMap = list.filter(it => it && it.sheet).reduce((map, it) => {
          map[it.sheet.id] = it;
          if (it.sheet.status === ExaminerStatusEnum.等待处理 || it.sheet.status === ExaminerStatusEnum.处理中) {
            ids.push(it.sheet.id);
          }
          return map;
        }, {});
        const run = (ids, waitTime = 2000) => {
          return new Promise((resolve, reject) => {
            clearTimeout(this.analyze_sid);
            this.analyze_sid = setTimeout(() => {
              analyze({ids: ids.join(',')}).then(({result: {list = []}} = {}) => {
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
          run(ids, 1000);
        }
      });
  };

  /**
   * 刷新任务队列状态
   * @param state
   * @returns {Promise<any>}
   */
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

  /**
   * 获取七牛上传对像
   * @returns {Qiniuyun}
   */
  getQiniuyun = () => {
    if (!this.qiniuyun) {
      this.qiniuyun = new Qiniuyun(buildQiniuConfig(this.props.token));
    }
    return this.qiniuyun;
  };

  /**
   * 上传答题卡
   * @param task
   * @returns {*}
   */
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

  /**
   * 解析后答题卡的处理
   * @param task
   * @param sheet
   */
  analyzeSheet = (task, sheet) => {
    const state = {};

    if (sheet && sheet.unitId && (!this.state.classMap || this.state.classMap[sheet.unitId])) {
      //加载对应的班级信息与班级学生
      this.loadClassStudent(sheet.unitId)
    }

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

  /**
   * 创建答题卡记录
   * @param task
   * @returns {*}
   */
  buildSheet = (task) => {
    if (task && task.url) {
      return createSheet(task).then(
        ({result}) => this.refreshTasksState(this.analyzeSheet(task, result))
      ).catch(ex => {
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
    // tasks.sort((a, b) => a.file.lastModified - b.file.lastModified);
    return this.tasksSortOfName(tasks);
  };

  tasksSortOfName = (tasks) => {
    const nameMap = tasks.reduce((map, it) => {
      map[it.name] = it;
      return map;
    }, {});
    const keys = Object.keys(nameMap).sort();
    console.log('=====>文件排序为<=======', keys);
    return keys.reduce((list, key) => {
      list.push(nameMap[key]);
      return list;
    }, []);
  };

  /**
   * 创建一个任务对象
   * @param file
   * @returns {{file: *, filename: string, name: *, status: string}}
   */
  createTask = (file) => {
    return {
      file,
      filename: buildFileName(file),
      status: '等待上传',
      name: file.fullPath || file.name,
    };
  };


  render() {


    const style = {
      flex: 1,
      border: this.state.drag ? '10px dashed #08f' : '10px dashed transparent',
      backgroundColor: this.state.drag ? 'rgba(0, 128, 255, 0.3)' : 'transparent',
    };

    const {tasks = [], editorTitle, classMap = {}, studentMap = {}} = this.state;


    return (
      <div className={classNames(styles['drag-uploader'], {
        [styles['has-data']]: tasks && tasks.length,
      })} style={style}
        // onDrop={this.handleDrop}
        // onDragOver={this.handleDragOver}
           onDragEnter={this.handleDragEnter}
           onDragLeave={this.handleDragLeave}
      >
        {
          editorTitle ?
            <h2 className={styles['editor-title']}>{editorTitle}</h2>
            :
            null
        }
        {
          tasks && tasks.length ?
            <TaskList tasks={tasks} classMap={classMap} studentMap={studentMap}/>
            :
            null
        }
      </div>
    )
  }
}


function TaskList({tasks, classMap, studentMap}) {
  return (
    <ul className={styles['task-list']}>
      {

        tasks.map((it) =>
          <Task key={it.filename} data={it} classMap={classMap} studentMap={studentMap}/>
        )
      }
    </ul>
  )
}

function Task(props) {
  const {data, classMap, studentMap} = props;
  if (data.sheet) {
    if (!data.class && data.sheet.unitId) {
      data.class = classMap[data.sheet.unitId];
    }
    if (!data.student && data.sheet.studentId) {
      data.student = studentMap[data.sheet.studentId];
    }
  }
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
            {
              data.sheet.unitId ?
                <div>
                  班级：{data.class ? data.class.name : data.sheet.unitId}
                </div>
                :
                null
            }
            {
              data.sheet.studentCode ?
                <div>
                  学生：{data.student ? data.student.name : data.sheet.studentCode}
                </div>
                :
                null
            }
          </Fragment>

          :
          null
      }
      <div className={styles['progress']}>
        <Progress {...data.progress}/>
      </div>

      <div className={classNames(styles['status'], {
        [styles['error']]: data.error,
      })} title={data.error ? data.error.message : null} onClick={() => {
        (data.sheet && data.sheet.debugUrl) ?
          window.open(data.sheet.debugUrl + '!page')
          :
          message.info('无调试图片')
      }}>
        {data.status}{data.error ? ':' + data.error.message : null}
      </div>
    </li>
  )
}
