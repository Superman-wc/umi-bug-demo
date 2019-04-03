import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {message, Progress, Tabs,} from 'antd';
import {Authenticate} from "../../utils/namespace";
import {ExaminerSheet as namespace, ManagesClass, ManagesStudent, AnswerEditor} from '../../utils/namespace';
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
import {toArray, copyFields, delay} from "../../utils/helper";


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
        key: 'look',
        type: 'primary',
        children: '显示' + (this.state.showStatisticsView ? '进度' : '统计'),
        onClick: () => {
          this.setState({showStatisticsView: !this.state.showStatisticsView});
        }
      },
      {
        key: '查看历史记录',
        children: '查看历史记录',

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
      },
      {
        key: 'rollback'
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
        <DragUploader
          ref={this.ref}
          dispatch={dispatch}
          token={authenticate.token}
          showStatisticsView={this.state.showStatisticsView}
        />
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
   this.safeSetState(state);
  };

  safeSetState(state, callback){
    if(this[DragUploader.mounted]){
     this.setState(state, callback);
    }
  }

  static mounted = Symbol('DragUploader#mounted');

  componentDidMount() {
    this[DragUploader.mounted] = true;
    document.addEventListener('drop', this.handleDrop, false);
    document.addEventListener('dragover', this.handleDragOver, false);
  }

  componentWillUnmount() {
    delete this[DragUploader.mounted];
    document.removeEventListener('drop', this.handleDrop);
    document.removeEventListener('dragover', this.handleDragOver);
  }

  handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
   this.safeSetState({drag: true});
  };

  handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
   this.safeSetState({drag: false});
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
    const sig = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const uploadTasks = this.buildTaskList(files, sig);
    let {tasks = [], waitUploadCount = 0} = this.state;

    waitUploadCount += uploadTasks.length;
    tasks = uploadTasks.concat(tasks);

    this.refreshTasksState({
      drag: false,
      tasks,
      waitUploadCount,

    }).then(() => {
      // 开始流水线任务
      return this.startFlowLine(uploadTasks)
    });
  };


  loadEditor = task => {
    return new Promise((resolve, reject) => {
      if (task.sheet && task.sheet.editorId) {
        const {editorId} = task.sheet;
        const {editorMap = {}} = this.state;
        task.step = 3;
        if (editorMap[editorId]) {
          // console.log('本地已经存在答题卡详情', editorMap[editorId]);
          resolve();
        } else {
          const {dispatch} = this.props;
          dispatch({
            type: AnswerEditor + '/item',
            payload: {id: editorId},
            resolve: (editor) => {
              const {editorMap = {}} = this.state;
              editorMap[editor.id] = copyFields(editor, ['id', 'title']);
              editorMap[editor.id].pageCount = editor.pages.length;
             this.safeSetState({
                editorMap: {...editorMap}
              }, resolve);
            },
            reject,
          });
        }
      } else {
        resolve();
      }
    });
  };

  static addTaskToKlassTaskMap(klass, task, editorId) {
    if (klass) {
      if (!klass.taskMap) {
        klass.taskMap = {};
      }
      if (!klass.taskMap[editorId]) {
        klass.taskMap[editorId] = [];
      }
      klass.taskMap[editorId].push(task);
    }
  }

  static addKlassToEditorClassMap(klass, editor) {
    if (editor) {
      if (!editor.classMap) {
        editor.classMap = {};
      }
      editor.classMap[klass.id] = klass;
    }
  }

  loadTaskClass = task => {
    return new Promise((resolve, reject) => {
      if (task.sheet && task.sheet.unitId && task.sheet.editorId) {
        task.step = 4;
        const {unitId, editorId} = task.sheet;
        const {classMap = {}, editorMap = {}} = this.state;
        if (classMap[unitId]) {
          DragUploader.addTaskToKlassTaskMap(classMap[unitId], task, editorId);
         this.safeSetState({
            classMap,
            editorMap: {...editorMap}
          }, resolve);
        } else {
          const {dispatch} = this.props;
          dispatch({
            type: ManagesClass + '/item',
            payload: {id: unitId},
            resolve: (res) => {
              const klass = copyFields(res, ['id', 'name']);
              const {editorMap = {}, classMap = {}} = this.state;


              DragUploader.addTaskToKlassTaskMap(klass, task, editorId);

              DragUploader.addKlassToEditorClassMap(klass, editorMap[editorId]);


              classMap[unitId] = klass;

             this.safeSetState({
                classMap,
                editorMap: {...editorMap}
              }, resolve);
            },
            reject,
          })
        }

      }
    })
  };

  /**
   * 添加任务到学生的任务Map中
   * @param student
   * @param task
   * @param editorId
   */
  static addTaskToStudentTaskMap(student, task, editorId) {
    if (student) {
      if (!student.taskMap) {
        student.taskMap = {};
      }
      if (!student.taskMap[editorId]) {
        student.taskMap[editorId] = [];
      }
      student.taskMap[editorId].push(task);
    }
  }

  /**
   * 构建班级学生集合
   * @param klass 班级
   * @param studentList 班级学生列表
   * @param allStudentMap 全校学生集合
   */
  static buildKlassStudentMap(klass, studentList, allStudentMap) {
    if (klass && studentList && studentList.length && allStudentMap) {
      klass.total = studentList.length;
      klass.studentMap = studentList.reduce((map, it) => {
        const student = allStudentMap[it.id] ||
          copyFields(it, ['id', 'name', 'code', 'avatar', 'klassId', 'klassName']);
        allStudentMap[it.id] = student;
        map[it.id] = student;
        return map;
      }, {});
    }
  }

  loadTaskStudent = task => {
    return new Promise((resolve, reject) => {
      if (task.sheet && task.sheet.unitId && task.sheet.studentId && task.sheet.editorId) {
        task.step = 5;
        const {classMap = {}, studentMap = {}, editorMap = {}} = this.state;
        const {unitId, studentId, editorId} = task.sheet;

        if (
          classMap[unitId] &&
          classMap[unitId].studentMap &&
          classMap[unitId].studentMap[studentId] &&
          studentMap[studentId]
        ) {

          DragUploader.addTaskToStudentTaskMap(studentMap[studentId], task, editorId);

         this.safeSetState({
            studentMap,
            classMap,
            editorMap: {...editorMap}
          }, resolve);

        } else {
          const {dispatch} = this.props;
          dispatch({
            type: ManagesStudent + '/list',
            payload: {
              klassId: unitId,
              s: 1000,
              simple: 1,
            },
            resolve: ({list = []} = {}) => {
              const {classMap = {}, studentMap = {}, editorMap = {}} = this.state;

              DragUploader.buildKlassStudentMap(classMap[unitId], list, studentMap);

              DragUploader.addTaskToStudentTaskMap(studentMap[studentId], task, editorId);

             this.safeSetState({
                classMap,
                studentMap,
                editorMap: {...editorMap}
              }, resolve)
            },
            reject,
          })
        }
      } else {
        resolve();
      }
    })
  };

  /**
   * 开始流水线工作
   * @param tasks
   * @returns {Promise<T|never>}
   */
  startFlowLine = (tasks) => {
    return flowLine([
      this.upload,                // 上传图片
      this.buildSheet,            // 构建答题卡记录
      this.loadEditor,            // 加载任务对应的答题卡
      this.loadTaskClass,         // 加载任务对应的班级
      this.loadTaskStudent,       // 加载任务对应的学生
    ], tasks).then(
      (list = []) => {
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
      resolve =>this.safeSetState({
          tasks: [...(this.state.tasks || [])],
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
          task.step = 1;
          return this.refreshTasksState();
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
        task.step = 1;
        return this.refreshTasksState();
      }).catch(ex => {
        task.error = ex;
        task.status = '上传出错';
        task.progress = {
          status: 'exception',
          percent: 34,
        };
        task.step = 1;
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
    task.step = 2;
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
        }
        // else if (this.state.editorId !== sheet.editorId) {
        //   task.error = new Error('不相同的答题卡');
        // }
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
        task.step = 2;
        return this.refreshTasksState();
      });
    }
    return Promise.resolve();
  };

  /**
   * 构建任务队列
   * @param files
   * @param sig 时间戳
   * @returns {Array}
   */
  buildTaskList = (files, sig) => {
    const tasks = [];
    for (let i = 0, len = files.length; i < len; i++) {
      const file = files[i];
      if (/image/i.test(file.type)) {
        tasks.push(this.createTask(file, sig));
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
   * @param sig
   * @returns {{file: *, filename: string, name: *, status: string}}
   */
  createTask = (file, sig) => {
    return {
      sig,
      file,
      filename: buildFileName(file),
      status: '等待上传',
      name: file.fullPath || file.name,
    };
  };

  log = () => {
    console.log(this.state);
  };


  render() {


    const style = {
      flex: 1,
      border: this.state.drag ? '10px dashed #08f' : '10px dashed transparent',
      backgroundColor: this.state.drag ? 'rgba(0, 128, 255, 0.3)' : 'transparent',
    };

    const {tasks = [], classMap = {}, studentMap = {}, editorMap} = this.state;


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
          this.props.showStatisticsView && editorMap ?
            <EditorTabs editorMap={editorMap}/>
            :
            tasks && tasks.length ?
              <TaskList tasks={tasks} classMap={classMap} studentMap={studentMap}/>
              :
              null
        }

      </div>
    )
  }
}

function EditorTabs({editorMap}) {
  return (
    <Tabs>
      {
        Object.values(editorMap).map(editor =>
          <Tabs.TabPane key={editor.id} tab={editor.loading ? '正在加载...' : editor.title}>
            {
              editor.classMap ?
                <KlassTabs editor={editor}/>
                :
                null
            }
          </Tabs.TabPane>
        )
      }
    </Tabs>
  )
}

function KlassTabs({editor}) {
  return (
    <Tabs>
      {
        Object.values(editor.classMap).map(klass =>
          <Tabs.TabPane
            key={[editor.id, klass.id].join('-')}
            tab={klass.loading ? '正在加载...' : klass.name}
          >
            <h3>
              {klass.name}共{klass.total}人,
              每份答题卡为{editor.pageCount}张,
              需收集{klass.total * editor.pageCount}张,
              目前处理{klass.taskMap && klass.taskMap[editor.id] && klass.taskMap[editor.id].length || 0}张
            </h3>
            {
              klass.studentMap ?
                <ul className={styles['class-student-list']}>
                  {
                    Object.values(klass.studentMap).map(student =>
                      <Student key={[editor.id, klass.id, student.id].join('-')}
                               student={student}
                               editor={editor}
                               klass={klass}
                      />
                    )
                  }
                </ul>
                :
                null
            }
          </Tabs.TabPane>
        )
      }
    </Tabs>
  )
}

function Student({editor, klass, student}) {

  const sheetCount = student.taskMap && student.taskMap[editor.id] && student.taskMap[editor.id].length || 0;

  return (
    <li key={[editor.id, klass.id, student.id].join('-')}
        data-id={[editor.id, klass.id, student.id].join('-')}
        data-task={Object.keys(student.taskMap || {}).join(',')}
        className={classNames({
          [styles['sheet']]: sheetCount
        })}
    >
      {
        student.loading ?
          <span>正在加载...</span>
          :
          <Fragment>
            <span>
              <img src={student.avatar + '!t'} width={30}/>
            </span>
            <div>
              <div>{student.name}({student.code})</div>
              {
                sheetCount ?
                  <div>
                    {sheetCount}张
                    {
                      editor.pageCount > 1 &&
                      student.taskMap &&
                      student.taskMap[editor.id] &&
                      student.taskMap[editor.id].length ?
                        <p>
                          {
                            student.taskMap[editor.id].map(task =>
                              <span key={task.sheet.id}>{task.sheet.page === 1 ? '反面' : '正面'}</span>
                            )
                          }
                        </p>
                        :
                        null
                    }
                  </div>
                  :
                  null
              }
            </div>
          </Fragment>
      }
    </li>
  )
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
    <li key={data.filename} className={styles['task']}>
      <a className={styles['file-name']}
           title={data.url ? '查看原始扫描图片' : '未上传'}
           onClick={() => {
             data.url ? window.open(data.url + '!page') : message.warning('图片还未上传，请稍等');
           }}
      >

        {data.name}
      </a>
      <div className={styles['class-name']}>
        {data.class && data.class.name}
      </div>
      <div className={styles['student-name']}>
        {data.student && data.student.name}
      </div>
      <div className={styles['sheet-page']}>
        {data.sheet && (data.sheet.page === 1 ? '反面' : '正面')}
      </div>
      <div className={styles['progress']}>
        {
          data.error ?
            <a className={styles['error']} title={data.error ? '查看详情' : '无详情'} onClick={() => {
                window.open((data.sheet && (data.sheet.debugUrl || data.sheet.rotatedUrl) || data.url) + '!page')
            }}>{data.error.message}</a>
            :
            <Progress {...data.progress}/>
        }

      </div>
      <div className={classNames(styles['status'], {[styles['error']]: data.error})}>
        {data.status}
      </div>
    </li>
  )
}

class TasksProgress extends Component {

  render() {
    const {tasks = [], stepCount = 1} = this.props;

    const total = tasks.length;
    const complete = tasks.filter(it => it.step >= stepCount).length;
    const upload = tasks.filter(it => it.step >= 1).length;
    const build = tasks.filter(it => it.step >= 2).length;

    const completeProgress = complete / total * 100 + '%';
    const uploadProgress = upload / total * 100 + '%';
    const buildProgress = build / total * 100 + '%';

    return (
      <div className={styles['tasks-progress']}>
        <div className={styles['progress']}>
          <div className={styles['upload-progress']} style={{width: uploadProgress}}/>
          <div className={styles['build-progress']} style={{width: buildProgress}}/>
          <div className={styles['total-progress']} style={{width: completeProgress}}/>
        </div>

        <ul className={styles['tasks-list']}>
          {
            tasks.map((task, index) =>
              <li key={task.filename}/>
            )
          }
        </ul>
      </div>
    )
  }

}
