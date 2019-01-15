import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Row, Col, message, Modal, Select, Divider, DatePicker, Input, notification, Checkbox} from 'antd';
import classnames from 'classnames';
import {
  ManagesClass, ManagesCourse,
  ManagesGrade, ManagesSubject,
  ManagesTeacher as namespace,
} from '../../../utils/namespace';

import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import styles from './index.less';
import ExcelImportModal from '../../../components/ExcelImport';
import Flex from '../../../components/Flex';
import {ClassTypeEnum} from "../../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  courseList: state[ManagesCourse].list,
  subjectList: state[ManagesSubject].list,
  classList: state[ManagesClass].list,
}))
export default class StudentList extends Component {

  state = {};

  componentDidMount() {
    const {subjectList, gradeList, classList, dispatch} = this.props;
    if (!subjectList) {
      dispatch({
        type: ManagesSubject + '/list',
        payload: {s: 1000}
      })
    }
    if (!gradeList) {
      dispatch({
        type: ManagesGrade + '/list',
        payload: {s: 1000}
      })
    }
    // if (!classList) {
    dispatch({
      type: ManagesClass + '/list',
      payload: {s: 1000}
    })
    // }
  }

  // fetchGradeList() {
  //   const {dispatch} = this.props;
  //   dispatch({
  //     type: ManagesGrade + '/list',
  //   });
  // }
  //
  // fetchCourseList(payload) {
  //   const {dispatch} = this.props;
  //   dispatch({
  //     type: ManagesCourse + '/list',
  //     payload
  //   });
  // }

  render() {
    const {
      list, total, loading,
      gradeList = [], courseList = [], subjectList = [], classList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const title = '教师列表';

    const breadcrumb = ['管理', '师资管理', title];

    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          this.setState({visible: true, item: null});
        },
      },
      {
        key: 'import',
        type: 'primary',
        children: '导入',
        title: '导入',
        icon: 'import',
        onClick: () => {
          this.setState({importModalVisible: true});
        },
      },
      {
        key:'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id', width: 40,},
      {title: '姓名', key: 'name', width: 50,},
      {title: '工号', key: 'code', width: 40},
      {title: '手机号', key: 'mobile', width: 80},
      {
        title: '教学范围', key: 'teachScopeList', width: 120, tac: false,
        render: v => v && v.map(it =>
          <span className={styles['subject-item']}
                key={[it.gradeId, it.subjectId].join('-')}>{it.gradeName + it.subjectName}</span>
        )
      },
      {
        title: '任课班级', key: 'klassTeacherList', width: 200, tac: false,
        render: v => v && v.map(it =>
          <span className={styles['subject-item']}
                key={[it.klassId, it.subjectId].join('-')}>{it.klassName + it.subjectName}</span>
        )
      },
      {
        title: '操作',
        key: 'operate',
        // width: 80,
        render: (id, row) => (
          <TableCellOperation
            operations={{
              edit: () => {
                this.setState({visible: true, item: row});
              },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
      },
    ];

    const teacherModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      subjectList, gradeList, classList,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        console.log(payload);
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '教师成功'});
            this.setState({visible: false});
          }
        });
      }
    };

    const importModalProps = {
      title: '导入教师',
      visible: this.state.importModalVisible,
      onCancel: () => this.setState({importModalVisible: false}),
      templateUrl: 'https://res.yunzhiyuan100.com/hii/老师管理录入模板（请勿随意更改模板格式，否则无法导入数据！）.xlsx',
      excelImport: (excelUrl) => {
        return new Promise((resolve, reject) => {
          dispatch({
            type: namespace + '/excelImport',
            payload: {
              excelUrl
            },
            resolve, reject
          });
        })
      }
    };

    return (
      <ListPage
        operations={buttons}
        location={location}
        loading={!!loading}
        columns={columns}
        breadcrumb={breadcrumb}
        list={list}
        total={total}
        pagination
        title={title}
        scrollHeight={176}
      >
        <TeacherModal {...teacherModalProps}/>
        <ExcelImportModal {...importModalProps} />
      </ListPage>
    )
  }
}

@Form.create({
  mapPropsToFields(props) {
    const {name, code, mobile, subjectsList, teachScopeList, klassTeacherList} = props.item || {};
    return {
      name: Form.createFormField({value: name || undefined}),
      code: Form.createFormField({value: code || undefined}),
      mobile: Form.createFormField({value: mobile || undefined}),
      subjectIds: Form.createFormField({value: subjectsList && subjectsList.length && subjectsList.map(it => (it.id)) || undefined}),
      teachScopeList: Form.createFormField({value: teachScopeList || undefined}),
      klassTeacherList: Form.createFormField({value: klassTeacherList || undefined}),
    }
  }
})
class TeacherModal extends Component {
  render() {
    const {
      visible, onCancel, onOk, item, subjectList = [], gradeList = [], classList = [],
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改教师' : '创建教师',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
            if (payload.subjectIds && payload.subjectIds.length) {
              payload.subjectIds = payload.subjectIds.join(',')
            }
            if (payload.teachScopeList) {
              payload.teachScopeList = JSON.stringify(payload.teachScopeList);
            }
            if (payload.klassTeacherList) {
              payload.klassTeacherList = JSON.stringify(payload.klassTeacherList);
            }
            // console.log(payload);
            onOk(payload);
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
          <Form.Item label="姓名" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入姓名', required: true}]
              })(
                <Input maxLength={64} placeholder="请输入姓名"/>
              )
            }
          </Form.Item>
          <Form.Item label="工号" {...wrapper}>
            {
              getFieldDecorator('code', {
                rules: [{message: '请输入工号', required: true}]
              })(
                <Input maxLength={24} placeholder="请输入工号"/>
              )
            }
          </Form.Item>
          <Form.Item label="手机号" {...wrapper} extra="微信登录时需要填写">
            {
              getFieldDecorator('mobile')(
                <Input maxLength={11} placeholder="请输入手机号"/>
              )
            }
          </Form.Item>
          <Form.Item label="教学范围" {...wrapper}>
            {
              getFieldDecorator('teachScopeList')(
                <TeachSubjectGradeScopeCheckbox gradeList={gradeList} subjectList={subjectList}/>
              )
            }
          </Form.Item>
          <Form.Item label="任课班级" {...wrapper}>
            {
              getFieldDecorator('klassTeacherList')(
                <TeachClassSubjectScopeCheckbox classList={classList} subjectList={subjectList}/>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}


class TeachClassSubjectScopeCheckbox extends Component {

  static CID = 0;

  constructor() {
    super(...arguments);
    this.id = 'TeachClassSubjectScopeCheckbox-' + (TeachClassSubjectScopeCheckbox.CID++);
  }

  state = {};

  componentDidMount() {
    document.addEventListener('click', this.onClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onClick);
  }

  onClick = (e) => {
    if (this.state.open) {
      const findId = ele => {
        return ele.id === this.id || (ele.parentElement && findId(ele.parentElement))
      };
      const v = findId(e.target);
      // console.log(v, e.target);
      if (!v) {
        this.setState({open: false});
      }
    }
  };

  render() {
    const {classList = [], subjectList = [], value = [], onChange} = this.props;
    const klassMap = classList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});
    const subjectMap = subjectList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    let selectedValue = [];

    const valueMap = value.reduce((map, it) => {
      selectedValue.push(it.klassName + it.subjectName);
      const m = map[it.klassId] || {};
      m[it.subjectId] = it;
      map[it.klassId] = m;
      return map;
    }, {});

    const klassId = this.state.klassId ||
      (value && value.length && value[0] && value[0].klassId) ||
      (classList && classList[0] && classList[0].id);

    const valueItem = valueMap[klassId] || {};

    const subjectValue = Object.keys(valueItem).map(key => key * 1);

    const klass = klassMap[klassId];

    return (
      <div id={this.id} className={styles['select-checkbox']}>
        <Select open={this.state.open} value={selectedValue.length ? selectedValue.join('、') : undefined}
                placeholder="请选择"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                onFocus={() => {
                  this.setState({open: true});
                }}
                dropdownRender={() => (
                  <Flex className={styles['select-checkbox-dropdown']}>
                    <Flex.Item className={styles['col-item']}>
                      <h3>班级</h3>
                      <div>
                        {
                          classList.map(it =>
                            <div key={it.id}
                                 className={
                                   classnames(styles['teach-scope-subject'], {
                                     [styles['selected']]: valueMap[it.id],
                                     [styles['current']]: klassId === it.id,
                                   })
                                 }
                                 onClick={() => {
                                   this.setState({klassId: it.id});
                                 }}
                            >
                              {it.type !== ClassTypeEnum.行政班 ? it.gradeName : ''}{it.name}
                            </div>
                          )
                        }
                      </div>
                    </Flex.Item>
                    <Flex.Item className={styles['col-item']}>
                      <h3>科目</h3>
                      <div>
                        <Checkbox.Group value={subjectValue} onChange={v => {
                          const vi = {};
                          v.forEach(subjectId => {
                            vi[subjectId] = {
                              klassId,
                              subjectId,
                              subjectName: subjectMap[subjectId].name,
                              klassName: klass.name
                            }
                          });
                          valueMap[klassId] = vi;
                          const vv = Object.values(valueMap).reduce((arr, it) => arr.concat(Object.values(it)), []);
                          onChange(vv);
                        }}>
                          {
                            klass && klass.subjectId ?
                              <div>
                                <Checkbox value={klass.subjectId}>{klass.subjectName}</Checkbox>
                              </div>
                              :
                              subjectList.map(it =>
                                <div key={it.id}>
                                  <Checkbox value={it.id}>{it.name}</Checkbox>
                                </div>
                              )
                          }
                        </Checkbox.Group>
                      </div>
                    </Flex.Item>
                  </Flex>
                )}/>
      </div>
    )
  }
}

class TeachSubjectGradeScopeCheckbox extends Component {

  static CID = 0;

  constructor() {
    super(...arguments);
    this.id = 'TeachSubjectGradeScopeCheckbox-' + (TeachSubjectGradeScopeCheckbox.CID++);
  }

  state = {};

  componentDidMount() {
    document.addEventListener('click', this.onClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onClick);
  }

  onClick = (e) => {
    if (this.state.open) {
      const findId = ele => {
        return ele.id === this.id || (ele.parentElement && findId(ele.parentElement))
      };
      const v = findId(e.target);
      // console.log(v, e.target);
      if (!v) {
        this.setState({open: false});
      }
    }
  };

  render() {
    const {gradeList = [], subjectList = [], value = [], onChange} = this.props;
    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});
    const subjectMap = subjectList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    let selectedValue = [];

    const valueMap = value.reduce((map, it) => {
      selectedValue.push(it.gradeName + it.subjectName);
      const m = map[it.subjectId] || {};
      m[it.gradeId] = it;
      map[it.subjectId] = m;
      return map;
    }, {});

    const subjectId = this.state.subjectId ||
      (value && value.length && value[0] && value[0].subjectId) ||
      (subjectList && subjectList[0] && subjectList[0].id);

    const valueItem = valueMap[subjectId] || {};

    const gradeValue = Object.keys(valueItem).map(key => key * 1);

    return (
      <div id={this.id} className={styles['select-checkbox']}>
        <Select open={this.state.open} value={selectedValue.length ? selectedValue.join('、') : undefined}
                placeholder="请选择"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                onFocus={(e) => {
                  this.setState({open: true});
                }}
                dropdownRender={() => (
                  <Flex className={styles['select-checkbox-dropdown']}>
                    <Flex.Item className={styles['col-item']}>
                      <h3>科目</h3>
                      <div>
                        {
                          subjectList.map(it =>
                            <div key={it.id}
                                 className={
                                   classnames(styles['teach-scope-subject'], {
                                     [styles['selected']]: valueMap[it.id],
                                     [styles['current']]: subjectId === it.id,
                                   })
                                 }
                                 onClick={() => {
                                   this.setState({subjectId: it.id});
                                 }}
                            >
                              {it.name}
                            </div>
                          )
                        }
                      </div>
                    </Flex.Item>
                    <Flex.Item className={styles['col-item']}>
                      <h3>年级</h3>
                      <Checkbox.Group value={gradeValue} onChange={v => {
                        const vi = {};
                        v.forEach(gradeId => {
                          vi[gradeId] = {
                            subjectId,
                            gradeId,
                            subjectName: subjectMap[subjectId].name,
                            gradeName: gradeMap[gradeId].name
                          }
                        });
                        valueMap[subjectId] = vi;
                        const vv = Object.values(valueMap).reduce((arr, it) => arr.concat(Object.values(it)), []);
                        onChange(vv);
                      }}>
                        {
                          gradeList.map(it =>
                            <div key={it.id}>
                              <Checkbox value={it.id}>{it.name + '（' + it.schoolYear + '级）'}</Checkbox>
                            </div>
                          )
                        }
                      </Checkbox.Group>
                    </Flex.Item>
                  </Flex>
                )}/>
      </div>
    )
  }
}
