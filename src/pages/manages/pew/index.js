import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {
  Form,
  Button,
  Icon,
  Popconfirm,
  Tree,
  Modal,
  notification,
  Cascader,
  Popover,
  Empty
} from 'antd';
import {
  ManagesGrade,
  ManagesClass,
  ManagesStudent,
  ManagesPew as namespace, ManagesClassroom,
} from '../../../utils/namespace';

import {ClassTypeEnum} from "../../../utils/Enum";
import Page from '../../../components/Page';
import PageHeaderOperation from '../../../components/Page/HeaderOperation';
import styles from './index.less';

const MOUSE_DOWN = Symbol('#pew-list@mouse-dow');

function findPewItem(ele) {
  if (!ele) {
    return null;
  }
  if (ele.className === styles['pew-item']) {
    return ele;
  } else if (ele.className === styles['pew-list']) {
    return null;
  } else {
    return findPewItem(ele.parentElement);
  }
}

class PewItem extends Component {
  render() {
    const {item, dispatch, onStateChange} = this.props;

    return (
      <li className={styles['pew-item']}
          style={{
            left: (item.columnIdx - 1) * 99 + 29 + 'px',
            top: (item.rowIdx - 1) * 139 + 29 + 'px',
          }}
          data-column-idx={item.columnIdx}
          data-row-idx={item.rowIdx}
          data-id={item.id}
          data-student-id={item.studentId}
      >
        {
          item.avatar ?
            <i className={styles['avatar']} style={{backgroundImage: `url(${item.avatar}!avatar)`}}/>
            :
            null
        }
        {
          item.studentName && item.unitName ?
            <div className={styles['student-info']}>
              {item.studentName}<br/>
              {item.unitName}
              <Popconfirm title="确定要清除这个学生吗？" onConfirm={() => {
                dispatch({
                  type: namespace + '/modify',
                  payload: {
                    id: item.id,
                    columnIdx: item.columnIdx,
                    rowIdx: item.rowIdx
                  }
                })
              }}>
                <Icon type="close" className={styles['pew-item-student-close']}/>
              </Popconfirm>
            </div>
            :
            <Button onClick={() => {
              onStateChange({visible: true, item});
            }}>填入学生</Button>
        }
        {
          <div className={styles['row-col']}>{`${item.rowIdx}x${item.columnIdx}`}</div>
        }
        <Popconfirm title="确定要删除这个座位吗？" onConfirm={() => {
          dispatch({
            type: namespace + '/remove',
            payload: {
              id: item.id
            }
          })
        }}>
          <Icon type="close" className={styles['pew-item-close']}/>
        </Popconfirm>
      </li>
    )
  }
}

@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
}))
class PewList extends Component {

  state = {};

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list',
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (nextProps.gradeList !== this.props.gradeList) {
      this.setState({
        gradeList: (list => list.map(({id, name}) => ({
          label: name,
          value: id,
          isLeaf: false,
          type: 'grade'
        })))(nextProps.gradeList || [])
      });
    }
    if (nextProps.list !== this.props.list && nextProps.list) {
      const {location: {query}} = this.props;
      let row = parseInt(query.rowTotal, 10) || 0;
      let col = parseInt(query.columnTotal, 10) || 0;
      let maxRow = 0;
      let maxCol = 0;
      nextProps.list.forEach(it => {
        maxRow = Math.max(it.rowIdx, maxRow);
        maxCol = Math.max(it.columnIdx, maxCol);
      });
      if (row !== maxRow || col !== maxCol) {
        setTimeout(() => {
          this.props.dispatch({
            type: ManagesClassroom + '/modify',
            payload: {
              id: query.classroomId,
              rowTotal: maxRow,
              columnTotal: maxCol
            }
          })
        })
      }
    }

  }

  mouseMoveItem = (e, status = 2) => {
    let {target, clientX, clientY, translateX, translateY} = this[MOUSE_DOWN];
    translateX += e.clientX - clientX;
    translateY += e.clientY - clientY;

    let {left, top} = target.style;

    left = parseInt(left, 10) + translateX - 30;
    top = parseInt(top, 10) + translateY - 30;

    const col = Math.round(left / 100) + 1;
    const row = Math.round(top / 140) + 1;

    target.style.transform = `translate(${translateX}px, ${translateY}px)`;

    const site = target.querySelector('.' + styles['row-col']);
    if (site) {
      site.innerText = `${row}x${col}`;
    }
    target.dataset.move = status;

    return {target, left, top, col, row};
  };

  moveItemElement = (ele, row, col, transition = 0) => {
    return new Promise(resolve => {
      ele.dataset.rowIdx = row;
      ele.dataset.columnIdx = col;
      if (transition) {
        ele.style.transition = `transform ${transition}ms, top ${transition}ms, left ${transition}ms`;
        const eventHandle = () => {
          resolve(ele);
          ele.removeEventListener('transitionend', eventHandle);
        };
        ele.addEventListener('transitionend', eventHandle);
      } else {
        ele.style.transition = '';
        setTimeout(() => {
          resolve(ele);
        })
      }
      ele.style.top = (row - 1) * 139 + 29 + 'px';
      ele.style.left = (col - 1) * 99 + 29 + 'px';
      ele.style.zIndex = 0;
      ele.style.transform = '';
      delete ele.dataset.move;
    })
  };

  renderRowHeaders = (rows) => {
    const rowHeaders = [];

    for (let i = 0; i < rows; i++) {
      rowHeaders.push(<li key={'row-header-' + i} className={styles['pew-row-header']}
                          style={{left: 0, top: i * 139 + 29 + 'px'}}>{i + 1 + '行'}</li>)
    }
    return rowHeaders;
  };

  renderColHeaders = (cols) => {
    const colHeaders = [];
    for (let i = 0; i < cols; i++) {
      colHeaders.push(<li key={'col-header-' + i} className={styles['pew-col-header']}
                          style={{top: 0, left: i * 99 + 29 + 'px'}}>{i + 1 + '列'}</li>)
    }
    return colHeaders;
  };

  handleMouseDown = (e) => {
    const pewItem = findPewItem(e.target);
    if (pewItem) {
      const [translateX = '0', translateY = '0'] = ((pewItem.style.transform || '').match(/\-?\d+/g) || []);
      this[MOUSE_DOWN] = {
        clientX: e.clientX,
        clientY: e.clientY,
        target: pewItem,
        translateX: parseInt(translateX, 10) || 0,
        translateY: parseInt(translateY, 10) || 0,
      };
      pewItem.dataset.move = 1;
      pewItem.style.transition = '';
      pewItem.style.zIndex = 2;
    }
  };

  handleMouseMove = (e) => {
    if (this[MOUSE_DOWN]) {
      this.mouseMoveItem(e);
    }
  };

  handleMouseUp = (e) => {
    if (this[MOUSE_DOWN]) {
      let {target, col, row} = this.mouseMoveItem(e);
      const {rowIdx, columnIdx, id, studentId} = target.dataset;
      const changed = rowIdx * 1 !== row || columnIdx * 1 !== col;

      if (changed) {
        const items = target.parentElement.querySelectorAll('.' + styles['pew-item']);
        let item;

        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (
            row === it.dataset.rowIdx * 1 &&
            col === it.dataset.columnIdx * 1 &&
            id !== it.dataset.id
          ) {
            item = it;
            break;
          }
        }

        if (item) {
          this.moveItemElement(item, rowIdx, columnIdx, 400).then(() => {
            this.props.dispatch({
              type: namespace + '/modify',
              payload: {
                id,
                pewId: item.dataset.id
              }
            })
          });
        } else {
          this.props.dispatch({
            type: namespace + '/modify',
            payload: {
              id, studentId,
              columnIdx: col,
              rowIdx: row,
            },
            reject: () => this.moveItemElement(target, rowIdx * 1, columnIdx * 1)
          });
        }
      }
      this.moveItemElement(target, row, col);
      delete this[MOUSE_DOWN];
    }
  };

  handleScroll = (e) => {
    const {target} = e;
    const {scrollLeft, scrollTop} = target;
    const header = target.querySelector('.' + styles['pew-header']);
    if (header) {
      header.style.transform = `translate(${scrollLeft}px, ${scrollTop}px)`;
    }
    const rowHeaders = target.querySelectorAll('.' + styles['pew-row-header']);
    if (rowHeaders && rowHeaders.length) {
      for (let i = 0, len = rowHeaders.length; i < len; i++) {
        rowHeaders[i].style.transform = `translate(${scrollLeft}px, ${0}px)`;
      }
    }
    const colHeaders = target.querySelectorAll('.' + styles['pew-col-header']);
    if (colHeaders && colHeaders.length) {
      for (let i = 0, len = colHeaders.length; i < len; i++) {
        colHeaders[i].style.transform = `translate(${0}px, ${scrollTop}px)`;
      }
    }
  };

  handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('dataRef');
    if (data) {
      const student = JSON.parse(data);
      const {clientX, clientY, target} = e;
      if (target.className === styles['pew-list']) {
        const {x, y} = target.getBoundingClientRect();
        const left = clientX - Math.round(x) - 30 + target.scrollLeft;
        const top = clientY - Math.round(y) - 30 + target.scrollTop;
        const columnIdx = Math.floor(left / 100) + 1;
        const rowIdx = Math.floor(top / 140) + 1;

        this.props.dispatch({
          type: namespace + '/create',
          payload: {
            classroomId: this.props.location.query.classroomId * 1,
            rowIdx,
            columnIdx,
            studentId: student.value
          }
        })
      }
      else {
        const pewItem = findPewItem(target);
        if (pewItem) {
          const {id, studentId, rowIdx, columnIdx} = pewItem.dataset;
          if (!studentId) {
            this.props.dispatch({
              type: namespace + '/modify',
              payload: {
                id,
                studentId: student.value,
                rowIdx, columnIdx
              }
            })
          } else {
            Modal.confirm({
              content: '确定替换学生吗？',
              onOk: () => {
                this.props.dispatch({
                  type: namespace + '/modify',
                  payload: {
                    id,
                    studentId: student.value,
                    rowIdx, columnIdx
                  }
                })
              }
            })
          }
        } else {
          console.log(target, pewItem);
        }
      }
    }
  };

  loadGradeKlassStudentData = treeNode => new Promise(resolve => {
    const {gradeList = []} = this.state;
    if (treeNode.props.children) {
      resolve();
    } else {
      const targetOption = treeNode.props.dataRef;
      if (targetOption.type === 'grade') {
        this.props.dispatch({
          type: ManagesClass + '/list',
          payload: {
            s: 10000,
            type: ClassTypeEnum.行政班,
            gradeId: targetOption.value
          },
          resolve: (({list = []} = {}) => {
            targetOption.loading = false;
            targetOption.children = list.map(({id, name}) => ({
              label: name,
              value: id,
              isLeaf: false,
              type: 'klass'
            }));
            this.setState({gradeList: [...gradeList]});
            resolve();
          }),
        })
      }
      else if (targetOption.type === 'klass') {
        this.props.dispatch({
          type: ManagesStudent + '/position',
          payload: {
            s: 10000,
            klassId: targetOption.value
          },
          resolve: ({list = []} = {}) => {
            targetOption.loading = false;
            targetOption.children = list.map(({id, name, gender, avatar, ...props}) => ({
              ...props,
              gender, avatar,
              label: name,
              value: id,
              isLeaf: true,
              type: 'student'
            }));
            this.setState({gradeList: [...gradeList]});
            resolve();
          }
        })
      }
    }
  });

  renderTreeNodes = (data, visible) => data.map(it =>
    <Tree.TreeNode
      title={
        it.type === 'student' ?
          <Popover placement="left" content={
            <div>
              {
                it.avatar ?
                  <img src={it.avatar + '!avatar'} width={100} height={150}
                       style={{margin: 'auto', display: 'block'}}/>
                  :
                  <div className="tac">无照片</div>
              }
              {
                it.pewId ?
                  <div className="tac">
                    {it.buildingName}
                    {it.layerName}
                    {it.classroomName}
                    <br/>
                    {it.rowIdx + '行'}
                    {it.columnIdx + '列'}
                  </div>
                  :
                  <div className="tac">无座位</div>
              }
            </div>
          }>
                <span draggable
                      onDragOver={e => e.preventDefault()}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('dataRef', JSON.stringify(it));
                      }}
                      style={{color: it.pewId ? '#333' : '#1b2389'}}
                >{it.label}</span>
          </Popover>
          :
          it.label
      }
      key={it.type + '-' + it.value}
      dataRef={it}
      isLeaf={it.isLeaf}
    >
      {
        it.children ?
          this.renderTreeNodes(
            it.type === 'klass' && !visible ?
              it.children.filter(m => !m.pewId)
              :
              it.children,
            visible)
          :
          null
      }
    </Tree.TreeNode>
  );

  render() {
    const {list = [], location, dispatch, onStateChange,} = this.props;

    const {gradeList = []} = this.state;

    const {query} = location;

    const title = (query.name || '') + '晚自习座位列表';

    const breadcrumb = ['管理', '德育教室管理', title];

    const headerOperation = <PageHeaderOperation dispatch={dispatch} buttons={[
      {key: 'rollback'},
      {
        key: 'add', children: '添加学生', onClick: () => {
          this.setState({visibleStudentTree: !this.state.visibleStudentTree});
        }
      },
      {
        key: 'clear', children: '清除学生', confirm: '确定要清除所有位置上的学生吗？',
        onConfirm: () => {
          dispatch({
            type: ManagesClassroom + '/clearStudent',
            payload: {
              id: query.classroomId
            },
            resolve: () => {
              dispatch({
                type: namespace + '/list',
                payload: {
                  ...query
                }
              })
            }
          })
        }
      }
    ]}/>;
    const header = (
      <Page.Header breadcrumb={breadcrumb} title={title} operation={headerOperation}/>
    );

    let maxRow = parseInt(query.rowTotal, 10) || 0;
    let maxCol = parseInt(query.columnTotal, 10) || 0;
    list.forEach(it => {
      maxRow = Math.max(it.rowIdx, maxRow);
      maxCol = Math.max(it.columnIdx, maxCol);
    });

    const pageProps = {
      header,
      location,
      mainDirection: 'row',
      mainClassName: styles['pew-page-main']
    };

    const pewListProps = {
      className: styles['pew-list'],
      onMouseDown: this.handleMouseDown,
      onMouseMove: this.handleMouseMove,
      onMouseUp: this.handleMouseUp,
      onDragOver: e => e.preventDefault(),
      onDrop: this.handleDrop,
      onScroll: this.handleScroll,
    };


    return (
      <Page {...pageProps}>
        {
          this.state.visibleStudentTree ?
            <div className={styles['student-tree']}>
              <div>
                <Button onClick={() => this.setState({visibleAllStudent: !this.state.visibleAllStudent})}>
                  {this.state.visibleAllStudent ? '只显示没有位置的学生' : '显示全部学生'}
                </Button>
              </div>
              <div>
                <Tree loadData={this.loadGradeKlassStudentData}>
                  {
                    this.renderTreeNodes(gradeList || [], this.state.visibleAllStudent)
                  }
                </Tree>
              </div>
            </div>
            :
            null
        }
        <ul {...pewListProps}>
          <li className={styles['pew-header']}>座位</li>
          {
            this.renderRowHeaders(maxRow)
          }
          {
            this.renderColHeaders(maxCol)
          }
          {
            list.map(it =>
              <PewItem key={it.id} item={it} dispatch={dispatch} onStateChange={onStateChange}/>
            )
          }
        </ul>
      </Page>
    );
  }
}


export default class PewListPageWrapperComponent extends Component {
  state = {};

  render() {

    const bedModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
    };

    const onStateChange = (state) => {
      this.setState(state);
    };

    return (
      <Fragment>
        <PewList {...this.props} {...this.state} onStateChange={onStateChange}/>
        <PewModal {...this.props} {...this.state} onStateChange={onStateChange} {...bedModalProps} />
      </Fragment>
    )
  }

}


@Form.create()
@connect(state => ({
  gradeList: state[ManagesGrade].list,
}))
class PewModal extends Component {

  state = {
    gradeList: []
  };

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list',
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (nextProps.gradeList !== this.props.gradeList) {
      this.setState({
        gradeList: (list => list.map(({id, name}) => ({
          label: name,
          value: id,
          isLeaf: false,
          type: 'grade'
        })))(nextProps.gradeList || [])
      });
    }
  }

  render() {
    const {
      visible, onCancel, item,
      form: {getFieldDecorator, validateFieldsAndScroll},
      dispatch,
    } = this.props;

    const {gradeList, student} = this.state;


    const modalProps = {
      visible,
      title: item && item.id ? '修改座位' : '创建座位',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
              payload.classroomId = item.classroomId;
              payload.rowIdx = item.rowIdx;
              payload.columnIdx = item.columnIdx;
            } else {
              payload.classroomId = item.classroomId;
              payload.rowIdx = item.rowIdx;
              payload.columnIdx = item.columnIdx;
            }
            payload.studentId = payload.studentId[2];
            console.log(payload, item);
            dispatch({
              type: namespace + (payload.id ? '/modify' : '/create'),
              payload,
              resolve: () => {
                notification.success({message: (payload.id ? '修改' : '创建') + '座位成功'});
                this.props.onStateChange({visible: false});
              }
            })
          }
        })
      }
    };
    const wrapper = {
      labelCol: {span: 5},
      wrapperCol: {span: 16}
    };
    return (
      <Modal {...modalProps}>
        <Form layout="horizontal">
          <Form.Item label="学生" {...wrapper}>
            {
              getFieldDecorator('studentId', {
                rules: [{
                  message: '请选择学生', required: true, validator: (rule, value, callback) => {
                    if (value && value.length === 3) {
                      callback();
                    } else {
                      callback(new Error(rule.message));
                    }
                  }
                },]
              })(
                <Cascader
                  placeholder="请选择学生"
                  allowClear
                  options={gradeList}
                  changeOnSelect
                  loadData={selectedOptions => {

                    const targetOption = selectedOptions[selectedOptions.length - 1];
                    targetOption.loading = true;
                    this.setState({gradeList: [...gradeList]});

                    if (targetOption.type === 'grade') {
                      dispatch({
                        type: ManagesClass + '/list',
                        payload: {
                          s: 10000,
                          type: ClassTypeEnum.行政班,
                          gradeId: targetOption.value
                        },
                        resolve: (({list = []} = {}) => {
                          targetOption.loading = false;
                          targetOption.children = list.map(({id, name}) => ({
                            label: name,
                            value: id,
                            isLeaf: false,
                            type: 'klass'
                          }));
                          this.setState({gradeList: [...gradeList]});
                        }),
                      })
                    }
                    else if (targetOption.type === 'klass') {
                      dispatch({
                        type: ManagesStudent + '/list',
                        payload: {
                          s: 10000,
                          klassId: targetOption.value
                        },
                        resolve: ({list = []} = {}) => {
                          targetOption.loading = false;
                          targetOption.children = list.map(({id, name, gender, avatar}) => ({
                            gender, avatar,
                            label: name + '(' + (gender ? '男' : '女') + ')',
                            value: id,
                            isLeaf: true,
                            type: 'student'
                          }));
                          this.setState({gradeList: [...gradeList]});
                        }
                      })
                    }

                  }}
                  onChange={([gradeId, klassId, studentId]) => {
                    if (gradeId, klassId, studentId) {
                      const grade = gradeList.find(it => it.value === gradeId);
                      if (grade && grade.children) {
                        const klass = grade.children.find(it => it.value === klassId);
                        if (klass && klass.children) {
                          const student = klass.children.find(it => it.value === studentId);
                          this.setState({student});
                        }
                      }
                    } else {
                      this.setState({student: null});
                    }
                  }}
                />
              )
            }
          </Form.Item>
          {
            student && student.avatar ?
              <img src={student.avatar} width={100} style={{display: 'block', margin: 'auto'}}/>
              :
              null
          }
        </Form>
      </Modal>
    )
  }
}
