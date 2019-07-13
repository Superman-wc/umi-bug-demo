import React, {Component, Fragment} from 'react';
import {connect} from 'dva';
import {Form, Modal, Select, Input, notification, Checkbox, Radio} from 'antd';
import {
  ManagesCourse as namespace,
  ManagesGrade,
  ManagesSubject,
  ManagesTeacher
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {CourseTypeEnum, Enums} from "../../../utils/Enum";
import router from 'umi/router';
import styles from './index.less';


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  subjectList: state[ManagesSubject].list,
  teacherList: state[ManagesTeacher].list,
}))
export default class CourseUniqueList extends Component {

  state = {};

  componentDidMount() {
    if (!this.props.gradeList) {
      this.props.dispatch({
        type: ManagesGrade + '/list',
        payload: {s: 10000}
      })
    }
    if (!this.props.subjectList) {
      this.props.dispatch({
        type: ManagesSubject + '/list',
        payload: {s: 10000}
      })
    }

  }

  render() {
    const {
      list, total, loading,
      gradeList = [], subjectList = [], teacherList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const subjectMap = subjectList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const grade = gradeMap[query.gradeId] || {};
    const subject = subjectMap[query.subjectId] || {};

    const title = (grade.name && (grade.name + '（' + (grade && grade.schoolYear) + '级）') || '') + (subject.name || '') + '课程列表';

    const breadcrumb = ['管理', '课程管理', title];

    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          this.setState({visible: true, item: {}});
        },
      },
      {
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id', width:40,},
      {
        title: '年级', key: 'gradeId', width: 130,
        render: (v, row) => row.gradeName + '（' + (gradeMap[row.gradeId] && gradeMap[row.gradeId].schoolYear || '-') + '级）',
        filters: gradeList.map(it => ({value: it.id, text: it.name + '（' + it.schoolYear + '级' + '）'})),
        filtered: !!query.gradeId,
        filterMultiple: false,
        filteredValue: query.gradeId ? [query.gradeId] : [],
      },
      {
        title: '科目', key: 'subjectId', width:80, render: (v, row) => row.subjectName,
        filters: subjectList.map(it => ({value: it.id, text: it.name})),
        filtered: !!query.subjectId,
        filterMultiple: false,
        filteredValue: query.subjectId ? [query.subjectId] : [],
      },
      {title: '名称', key: 'name', width: 120},
      {title: '类型', key: 'type', width:100, render: v => CourseTypeEnum[v]},
      {
        title: '行政班', key: 'belongToExecutiveClass', width:80, render: v => v ? '是' : '',
        filters: [{value: true, text: '是'}, {value: false, text: '否'}],
        filtered: !!query.belongToExecutiveClass,
        filterMultiple: false,
        filteredValue: query.belongToExecutiveClass ? [query.belongToExecutiveClass] : [],
      },
      {
        title: '分层', key: 'hierarchy', width:80, render: v => v ? '是' : '',
        filters: [{value: true, text: '是'}, {value: false, text: '否'}],
        filtered: !!query.hierarchy,
        filterMultiple: false,
        filteredValue: query.hierarchy ? [query.hierarchy] : [],
      },
      {
        title: '教师', key: 'teacherList', width: 'auto', tac:false,
        render: v => (
          v ? v.map(it => <span className={styles['course-teacher']} key={it.id}>{it.name}</span>) : null
        )
      },
      {
        title: '操作', key: 'operate', width: 180,
        render: (id, row) => (
          <TableCellOperation
            operations={{
              allot: {
                children: '分配教师', onClick: () => {
                  dispatch({
                    type: ManagesTeacher + '/list',
                    payload: {
                      s: 1000,
                      subjectId: row.subjectId
                    }
                  });
                  this.setState({item: row, allotTeacherModalVisible: true});
                }
              },
              edit: () => this.setState({visible: true, item: row}),
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
      },
    ];

    const courseModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      gradeList, subjectList,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '课程成功'});
            this.setState({visible: false});
          }
        })
      },
    };

    const allotTeacherModalProps = {
      visible: this.state.allotTeacherModalVisible,
      item: this.state.item,
      teacherList,
      onCancel: () => this.setState({allotTeacherModalVisible: false}),
      onOk: (payload) => {
        dispatch({
          type: namespace + '/modify',
          payload,
          resolve: () => {
            notification.success({message: '分配教师成功'});
            this.setState({allotTeacherModalVisible: false});
          }
        })
      },
    }


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
      >
        <CourseModal {...courseModalProps} />
        <AllotTeacherModal {...allotTeacherModalProps} />
      </ListPage>
    );
  }
}


@Form.create({
  mapPropsToFields(props) {
    const {teacherIds} = props.item || {};
    return {
      teacherIds: Form.createFormField({value: teacherIds || undefined})
    };
  }
})
class AllotTeacherModal extends Component {


  render() {
    const {
      visible, onCancel, onOk, item = {}, teacherList = [],
      form: {getFieldDecorator, validateFieldsAndScroll, setFieldsValue},
    } = this.props;

    const modalProps = {
      destroyOnClose: true,
      visible,
      title: `给${item.gradeName}${item.name}分配教师`,
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            payload.teacherIds = payload.teacherIds.join(',');
            onOk({...item, ...payload});
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
        {
          teacherList && teacherList.length ?
            <Form layout="horizontal">
              <Form.Item label="教师" {...wrapper} help={
                <Checkbox onChange={e => {
                  if (e.target.checked) {
                    const teacherIds = teacherList.map(it => it.id);
                    setFieldsValue({teacherIds});
                  } else {
                    setFieldsValue({teacherIds: []});
                  }
                }}>全选</Checkbox>
              }>
                {
                  getFieldDecorator('teacherIds', {rules: [{message: '请选择教师', required: true}]})(
                    <Checkbox.Group className={styles['teacher-checkbox-list']} options={teacherList.map(it => ({value: it.id, label: it.name}))}/>
                  )
                }
              </Form.Item>
            </Form>
            :
            <div>还没有教{item.subjectName}的教师，去<a onClick={() => router.push(ManagesTeacher)}>教师管理</a>设置</div>
        }

      </Modal>
    )
  }
}

@Form.create({
  mapPropsToFields(props) {
    const {name, type, gradeId, belongToExecutiveClass, hierarchy, memo, subjectId} = props.item || {};
    return {
      gradeId: Form.createFormField({value: gradeId || undefined}),
      subjectId: Form.createFormField({value: subjectId || undefined}),
      name: Form.createFormField({value: name || undefined}),
      type: Form.createFormField({value: type && type.toString() || undefined}),
      belongToExecutiveClass: Form.createFormField({value: belongToExecutiveClass || false}),
      hierarchy: Form.createFormField({value: hierarchy || false}),
      memo: Form.createFormField({value: memo || undefined}),

    }
  },
})
class CourseModal extends Component {


  render() {
    const {
      visible, onCancel, onOk, item = {}, subjectList = [], gradeList = [],
      form: {getFieldDecorator, validateFieldsAndScroll},
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改课程' : '创建课程',
      onCancel,
      width: 600,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
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
          <Form.Item label="年级" {...wrapper}>
            {
              getFieldDecorator('gradeId', {
                rules: [{message: '请选择年级', required: true}]
              })(
                <Select placeholder="请选择">
                  {
                    gradeList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="科目" {...wrapper}>
            {
              getFieldDecorator('subjectId', {
                rules: [{message: '请选择科目', required: true}]
              })(
                <Select placeholder="请选择">
                  {
                    subjectList.map(it =>
                      <Select.Option key={it.id} value={it.id}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="类型" {...wrapper} help="高中阶段选科使用，初中都是“非学考选考”">
            {
              getFieldDecorator('type', {
                rules: [{message: '请选择课程类型', required: true}]
              })(
                <Select placeholder="请选择">
                  {
                    Enums(CourseTypeEnum).map(it =>
                      <Select.Option key={it.value} value={it.value}>{it.name}</Select.Option>
                    )
                  }
                </Select>
              )
            }
          </Form.Item>
          <Form.Item label="行政班" {...wrapper} help="高中阶段区别于走班形式">
            {
              getFieldDecorator('belongToExecutiveClass', {
                rules: [{message: '请选择是否行政班', required: true}]
              })(
                <Radio.Group placeholder="请选择">
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              )
            }

          </Form.Item>
          <Form.Item label="分层" {...wrapper} help="高中阶段同一科目走班时区分不同层次的学生， 如物理A、物理B">
            {
              getFieldDecorator('hierarchy', {
                rules: [{message: '请选择是否分层', required: true}]
              })(
                <Radio.Group placeholder="请选择">
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              )
            }
          </Form.Item>
          <Form.Item label="名称" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入课程名称', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="备注" {...wrapper}>
            {
              getFieldDecorator('memo')(
                <Input.TextArea maxLength={500} rows={5}/>
              )
            }
          </Form.Item>

        </Form>
      </Modal>
    )
  }
}
