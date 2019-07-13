import {Component} from 'react';
import {connect} from 'dva';
import {Input, Button, notification, Popconfirm, Row, Col} from 'antd';
import {ManagesDormCard as namespace} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import router from 'umi/router';
import styles from './index.less';


@connect(state => ({
  loading: state[namespace].loading,
  total: state[namespace].total,
  list: state[namespace].list,
}))
export default class DormCard extends Component {

  state = {
    searchValue: '',
  };

  componentDidMount() {
    const {location:{query:{name}}} = this.props;
    name && this.setState({ searchValue: name });
  }

  onSearch =(name)=> {
    if (name) {
      const {location: {pathname, query}} = this.props;
      router.replace({pathname, query:{...query, name}});
    }
  };

  reset = () => {
    this.setState({searchValue: ''});
    const {location: {pathname, query}} = this.props;
    router.replace({pathname, query:{...query, name:undefined}});
  };

  render() {
    const {loading, list = [], total, dispatch, location = {}} = this.props;
    const {query = {}} = location;
    const title = '宿舍卡申请';
    const breadcrumb = ['宿舍卡管理', '宿舍卡申请'];

    const searchProps = {
      className: styles['search'],
      placeholder: "请输入学生姓名搜索",
      enterButton: "搜索",
      size: "default",
      value: this.state.searchValue,
      onChange: (e) => {
        this.setState({searchValue: e.target.value});
      },
      onSearch: value => {
        this.onSearch(value)
      }
    };

    const headerChildren = (
      <div className={styles["search-container"]}>
        <Input.Search {...searchProps}/>
        <Button style={{marginLeft: 10}} onClick={this.reset}>重置</Button>

      </div>
    );

    const statusList = [
      {value: 1, text: '未开卡'},
      {value: 2, text: '已开卡'},
      {value: 3, text: '已撤销'},
    ];

    const columns = [
      {
        title: '学生',
        key: 'id',
        width: 240,
        render: (text, record) => {
          return (
            <Row type="flex" align="middle">
              <Col span={8}>
                <img width={50} src={record.avatar} alt={`${record.studentName}的头像`}/>
              </Col>
              <Col span={16}>
                <div className={styles["student-name"]}>{record.unitName}</div>
                <div className={styles["student-name"]}>{record.studentName}({record.code})</div>
              </Col>
            </Row>
          )
        }
      },
      {
        title: '宿舍号(床位)', key: 'dorm', width: 100,
        render: (text, record) => `${record.buildingName}${record.layerName}${record.dormitoryName}(${record.bedName}床)`
      },
      {title: '申请教师', key: 'creatorName', width: 80,},
      {title: '申请时间', key: 'lastUpdated', width: 150, format: 'YYYY-MM-DD HH:mm',},
      {title: '备注', key: 'memo', width: 'auto', tac: false},
      {
        title: '状态', key: 'status', width: 120,
        render: (v, record) => {
          const {status, id, studentName} = record;
          return [
            '-',
            <Popconfirm
              title={`确定为[${studentName}]开卡`}
              onConfirm={() => {
                dispatch({
                  type: namespace + '/modify',
                  payload: {
                    id
                  },
                  resolve: () => {
                    notification.success({message: '开卡成功'});
                    dispatch({
                      type: namespace + '/list',
                      payload: {
                        ...query
                      }
                    })
                  }
                })
              }}
              okText="确定"
              cancelText="取消">
              <Button type="primary" size="small">未开卡</Button>
            </Popconfirm>,
            '已开卡',
            '已撤销'
          ][status];
        },
        filters: statusList,
        filtered: !!query.status,
        filterMultiple: false,
        filteredValue: query.status ? [query.status] : [],
      },
    ];

    return (
      <ListPage
        location={location}
        loading={!!loading}
        columns={columns}
        breadcrumb={breadcrumb}
        list={list}
        total={total}
        pagination
        title={title}
        scrollHeight={175}
        headerChildren={
          headerChildren
        }
      />
    )
      ;
  }
}

