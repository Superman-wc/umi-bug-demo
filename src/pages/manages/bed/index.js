import React, {Component} from 'react';
import {connect} from 'dva';
import {Form, Modal,  notification, Cascader} from 'antd';
import {
  ManagesGrade,
  ManagesClass,
  ManagesStudent,
  ManagesBed as namespace,
} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import TableCellOperation from '../../../components/TableCellOperation';
import {ClassTypeEnum} from "../../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
}))
class BedList extends Component {

  state = {};

  // componentDidMount() {
  //   const {dispatch} = this.props;
  //   dispatch({
  //     type: ManagesGrade + '/list',
  //   });
  // }


  render() {
    const {list, total, loading, location, dispatch} = this.props;

    const {pathname, query} = location;

    const title = (query.name || '') + '床位列表';

    const breadcrumb = ['管理', '寝室管理', title];

    const buttons = [
      // {
      //   key: 'create',
      //   type: 'primary',
      //   children: '创建',
      //   title: '创建',
      //   icon: 'plus',
      //   onClick: () => {
      //     this.setState({visible: true, item: null});
      //   },
      // },
      {
        key: 'rollback'
      }
    ];

    const columns = [
      // {title: 'ID', key: 'id'},
      {title: '床号', key: 'name'},
      {title: '班级', key: 'unitName',},
      {title: '学生', key: 'studentName'},
      {title: '学生照片', key: 'avatar', render: v => v ? <img width={60} src={v + '!avatar'}/> : '', width: 100,},

      {
        title: '操作',
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              edit: () => this.props.onStateChange({visible: true, item: row}),
              reset:{
                children:'重置',
                onConfirm: () => dispatch({type: namespace + '/modify', payload: {id}}),
              }
              // remove: {
              //   onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              // },
              // look: () => router.push({
              //   pathname: row.type === BuildingTypeEnum.生活区 ? ManagesDormitory : ManagesClassRoom,
              //   query: {buildingId: id, buildingType: row.type}
              // })
            }}
          />
        ),
      },
    ];


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
      />
    );
  }
}

export default class BedListPageWrapperComponent extends Component {
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
      <div>
        <BedList {...this.props} {...this.state} onStateChange={onStateChange}/>
        <BedModal {...this.props} {...this.state} onStateChange={onStateChange} {...bedModalProps} />
      </div>
    )
  }

}


@Form.create()
@connect(state => ({
  gradeList: state[ManagesGrade].list,
}))
class BedModal extends Component {

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
      console.log('init gradeList');
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
      dispatch, location: {query},
    } = this.props;

    const {gradeList, student} = this.state;
    console.log('selectedOptions=', student);

    const modalProps = {
      visible,
      title: item && item.id ? '修改床位' : '创建床位',
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            if (item && item.id) {
              payload.id = item.id;
            }
            payload.studentId = payload.studentId[2];
            // console.log(payload);
            dispatch({
              type: namespace + (payload.id ? '/modify' : '/create'),
              payload,
              resolve: () => {
                notification.success({message: (payload.id ? '修改' : '创建') + '楼层成功'});
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
                          // console.log(list);
                          targetOption.loading = false;
                          targetOption.children = list.filter(it => it.gender.toString() === query.gender.toString()).map(({id, name, gender, avatar}) => ({
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
                    // console.log(gradeId, klassId, studentId);
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
