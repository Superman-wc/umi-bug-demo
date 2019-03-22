import React, {Component} from 'react';
import {connect} from 'dva';
import router from "umi/router";
import {Form, Modal,  InputNumber, Radio} from 'antd';
import {
  AnswerEditor as namespace, ExaminerPrint,
  ManagesGrade, ManagesSubject,
} from '../../utils/namespace';
import ListPage from '../../components/ListPage';
import TableCellOperation from '../../components/TableCellOperation';
import {AnswerCardTypeEnum} from "../../utils/Enum";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  gradeList: state[ManagesGrade].list,
  subjectList: state[ManagesSubject].list,
  // klassList: state[ManagesClass].list,
  loadingPrint: state[ExaminerPrint].loading,
}))
export default class ExaminerAnswerListPage extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, location: {query}} = this.props;
    dispatch({
      type: namespace + '/list',
      payload: {...query}
    });
    dispatch({
      type: ManagesGrade + '/list',
      payload: {s: 10000}
    });
    dispatch({
      type: ManagesSubject + '/list',
      payload: {s: 10000}
    });
    // dispatch({
    //   type: ManagesClass + '/list',
    //   payload: {s: 10000, simple: 1}
    // });
  }


  render() {
    const {
      list, total, loading, location, dispatch,
      gradeList = [], subjectList = [],  loadingPrint
    } = this.props;

    const gradeMap = gradeList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});

    const subjectMap = subjectList.reduce((map, it) => {
      map[it.id] = it;
      return map;
    }, {});


    const {pathname, query} = location;

    const title = '答题卡列表';

    const breadcrumb = ['管理', '答题卡管理', title];

    const buttons = [
      {
        key: 'create',
        type: 'primary',
        children: '创建',
        title: '创建',
        icon: 'plus',
        onClick: () => {
          dispatch({
            type: namespace+'/newFile',
          });
          router.push({pathname: namespace + '/editor'});
        },
      },
      {
        key: 'rollback'
      }
    ];

    const columns = [
      {title: 'ID', key: 'id'},
      {title: '文件', key: 'title', width: 250},
      {title: '版本', key: 'ver', width: 40,},
      {title: '年级', key: 'gradeId', render: v => gradeMap && gradeMap[v] && gradeMap[v].name || v},
      {title: '科目', key: 'subjectId', render: v => subjectMap && subjectMap[v] && subjectMap[v].name || v},
      {title: '类型', key: 'type', render: v => AnswerCardTypeEnum[v] || v},
      {title: '创建时间', key: 'dateCreated', width: 100,},
      {
        title: '操作', width: 100,
        key: 'operate',
        render: (id, row) => (
          <TableCellOperation
            operations={{
              print: () => {
                this.setState({printModalVisible: true, item: row});
              },
              edit: () => {
                router.push({pathname: namespace + '/editor', query: {id}});
              },
              remove: {
                onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}}),
              },
            }}
          />
        ),
      },
    ];

    const listPageProps = {
      location, columns, breadcrumb, list, total, title,
      operations: buttons,
      loading: !!loading,
      pagination: true,
    };

    const printModalProps = {
      loading: loadingPrint,
      visible: this.state.printModalVisible,
      onOk: (payload) => {
        const {item} = this.state;
        payload.editorId = item.id;
        payload.name = item.title;
        dispatch({
          type: ExaminerPrint + '/create',
          payload,
          resolve: () => {
            this.setState({printModalVisible: false});
            Modal.success({
              title: '您的打印需求已经成功受理',
              content:'请注意打印完成的消息，及时领取您的答题卡'
            });
          }
        })
      },
      onCancel: () => this.setState({printModalVisible: false})
    };

    return (
      <ListPage {...listPageProps}>
        <PrintModal {...printModalProps}/>
      </ListPage>
    );
  }
}

@Form.create()
class PrintModal extends Component {
  render() {

    const {
      onOk, onCancel, visible, loading,
      form: {getFieldDecorator, validateFieldsAndScroll},
    } = this.props;

    const modalProps = {
      visible, loading, onCancel,
      title: '打印申请',
      onOk: () => {
        validateFieldsAndScroll((errors, payload) => {
          if (errors) {
            console.error(errors);
          } else {
            console.log(payload);
            payload.requirement = payload.requirement ? '双面' : '单面';
            onOk && onOk(payload);
          }
        })
      }
    };
    const formProps = {
      layout: 'horizontal',
    };
    const formItemProps = {
      wrapperCol: {span: 16},
      labelCol: {span: 4}
    };
    return (
      <Modal {...modalProps}>
        <Form {...formProps}>
          <Form.Item label="打印要求" {...formItemProps}>
            {
              getFieldDecorator('requirement', {
                initialValue: 0,
                rules: [{required: true, message: '请输入打印份数'}]
              })(
                <Radio.Group options={[{label: '单面打印', value: 0}, {label: '双面打印', value: 1}]}/>
              )
            }
          </Form.Item>
          <Form.Item label="打印份数" {...formItemProps}>
            {
              getFieldDecorator('count', {
                initialValue: 50,
                rules: [{required: true, message: '请输入打印份数'}]
              })(
                <InputNumber min={1} max={1000}/>
              )
            }
          </Form.Item>

        </Form>
      </Modal>
    )
  }
}
