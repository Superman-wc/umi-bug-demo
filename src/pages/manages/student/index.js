import React, {Component} from 'react';
import {connect} from 'dva';
import router from 'umi/router';
import {Form, Modal, Input, notification, Radio,} from 'antd';
import {ManagesClass, ManagesGrade, ManagesStudent as namespace, ManagesSubject} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import styles from './index.less';
import ExcelImportModal, {buildImportStudentProps} from '../../../components/ExcelImportModal';
import {ClassTypeEnum} from "../../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  classList: state[ManagesClass].list,
  subjectList: state[ManagesSubject].list,
}))
export default class StudentList extends Component {

  state = {};

  componentDidMount() {
    this.fetchGradeList();
    this.fetchClassList();
    this.fetchSubjectList();
  }

  fetchGradeList() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesGrade + '/list',
      payload: {s: 1000}
    });
  }

  fetchClassList() {
    const {dispatch} = this.props;
    dispatch({
      type: ManagesClass + '/list',
      payload: {s: 1000}
    });
  }

  fetchSubjectList() {
    this.props.dispatch({
      type: ManagesSubject + '/list',
      payload: {s: 10000}
    })
  }

  render() {
    const {
      list, total, loading,
      gradeList = [], classList = [], subjectList = [],
      location, dispatch
    } = this.props;

    const {pathname, query} = location;

    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const classMap = classList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const grade = gradeMap[query.gradeId] || {};
    const klass = classMap[query.klassId] || {};

    const title = (klass.name || (grade.name && (grade.name + '（' + grade.schoolYear + '级）')) || '') + (query.gender === 'true' ? '男' : query.gender === 'false' ? '女' : '') + '学生列表';

    const breadcrumb = ['管理', '学生管理', title];


    const buttons = [
      {
        key: 'rollback'
      }
    ];

    if (query.klassId && klass && klass.type === ClassTypeEnum.行政班) {

      buttons.push(
        {
          key: 'create',
          type: 'primary',
          children: '创建',
          title: '创建',
          icon: 'plus',
          onClick: () => {
            this.setState({visible: true, item: null});
          },
        }
      );

      buttons.push(
        {
          key: 'import',
          type: 'primary',
          children: '导入' + (klass.name || '') + '学生',
          title: '导入',
          icon: 'import',
          onClick: () => {
            this.setState({importModalVisible: true});
          },
        }
      )
    }

    let filterClassList = classList;
    if (query.gradeId) {
      filterClassList = classList.filter(it => it.gradeId === query.gradeId * 1);
    }

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '学号', key: 'code', width: 100},
      {title: '姓名', key: 'name', width: 100},
      {
        title: '年级', key: 'gradeId',
        filters: gradeList.map(it => ({value: it.id, text: it.name + '（' + it.schoolYear + '级' + '）'})),
        filtered: !!query.gradeId,
        filterMultiple: false,
        filteredValue: query.gradeId ? [query.gradeId] : [],
        render: (gradeId, row) => row.gradeName,
        width: 70,
      },
      {
        title: '班级', key: 'klassId',
        filters: filterClassList.map(it => ({value: it.id, text: it.name})),
        filtered: !!query.klassId,
        filterMultiple: false,
        filteredValue: query.klassId ? [query.klassId] : [],
        render: (classId, row) => row.klassName,
        width: 130, tac:false,
      },
      {
        title: '性别', key: 'gender', render: v => v ? '男' : '女',
        filters: [{value: true, text: '男'}, {value: false, text: '女'}],
        filtered: !!query.gender,
        filterMultiple: false,
        filteredValue: query.gender ? [query.gender] : [],
        width: 70,
      },
      {
        title: '照片', key: 'avatar', render: v => v ? <img src={v + '!avatar'} width={40}/> : '', width: 60,
      },
      {
        title: '选考科目', key: 'electionExaminationCourseEntityList', width: 'auto', tac:false,
        render: list => list ? list.map(it => <span className={styles['separate']} key={it.id}>{it.name}</span>) : ''
      },
      {
        title: '学考科目', key: 'studyExaminationCourseEntityList', width: 'auto', tac:false,
        render: list => list ? list.map(it => <span className={styles['separate']} key={it.id}>{it.name}</span>) : ''
      },
      {
        title: '操作',
        key: 'operate',
        width: 120,
        render: (id, item) => (
          <TableCellOperation
            operations={{
              edit: () => {
                this.setState({visible: true, item});
              },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
      },
    ];

    const studentModalProps = {
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: (payload) => {
        payload.klassId = query.klassId;
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => {
            notification.success({message: (payload.id ? '修改' : '创建') + '学生成功'});
            this.setState({visible: false});
          }
        })
      }
    };

    const importModalProps = buildImportStudentProps({
      klass,
      visible: this.state.importModalVisible,
      onCancel: () => this.setState({importModalVisible: false}),
      subjectList,
      dispatch,
    });

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
        scrollHeight={162}
        onChange={(pagination, filters) => {
          if (filters.klassId && filters.klassId[0] && filters.gradeId && filters.gradeId.length) {
            const klass = classList.find(it => it.id * 1 === filters.klassId[0] * 1);
            if (klass && klass.gradeId && klass.gradeId !== filters.gradeId[0] * 1) {
              return {klassId: undefined};
            }
          }
          return {};
        }}
        headerChildren={
          <div>
            <Input.Search
              placeholder="输入学号或姓名"
              enterButton="搜索"
              onSearch={value => {
                const args = {};
                if(value){
                  if(/^\d+/g.test(value)){
                    args.code = value;
                    args.name = undefined;
                  }else{
                    args.name = value;
                    args.code = undefined;
                  }
                }else{
                  args.name = undefined;
                  args.code = undefined;
                }
                router.replace({pathname, query: {...query, ...args}});
              }}
            />
          </div>
        }
      >
        <StudentModal {...studentModalProps} />
        <ExcelImportModal {...importModalProps} />
      </ListPage>
    )
  }
}


@Form.create({
  mapPropsToFields(props) {
    const {name, code, gender} = props.item || {};
    return {
      name: Form.createFormField({value: name || undefined}),
      code: Form.createFormField({value: code || undefined}),
      gender: Form.createFormField({value: gender || false}),
    }
  }
})
class StudentModal extends Component {

  componentDidMount() {
  }

  render() {
    const {
      visible, onCancel, onOk, item,
      form: {getFieldDecorator, validateFieldsAndScroll}
    } = this.props;
    const modalProps = {
      visible,
      title: item && item.id ? '修改学生' : '创建学生',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
            console.log(payload);
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
          <Form.Item label="学号" {...wrapper}>
            {
              getFieldDecorator('code', {
                rules: [{message: '请输入学号', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="姓名" {...wrapper}>
            {
              getFieldDecorator('name', {
                rules: [{message: '请输入姓名', required: true}]
              })(
                <Input maxLength={64}/>
              )
            }
          </Form.Item>
          <Form.Item label="性别" {...wrapper}>
            {
              getFieldDecorator('gender', {
                rules: [{message: '请选择性别', required: true}]
              })(
                <Radio.Group placeholder="请选择">
                  <Radio value={true}>男</Radio>
                  <Radio value={false}>女</Radio>
                </Radio.Group>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}


