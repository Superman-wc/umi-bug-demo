import {Component} from 'react';
import {connect} from 'dva';
import {Input, Button, notification, Popconfirm, Row, Col} from 'antd';
import moment from 'moment';
import {ManagesDormCard as namespace} from '../../../utils/namespace';
import ListPage from '../../../components/ListPage';
import {routerRedux} from 'dva/router';
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
    // 刷新时恢复搜索框的值
    const {location = {}} = this.props;
    const {query = {}} = location;
    const name = query.name || '';
    if (name) {
      this.setState({
        searchValue: name
      })
    }
  }

  onSearch(value) {
    if (value) {
      const {dispatch, location: {pathname, query}} = this.props;
      dispatch(routerRedux.replace({
        pathname,
        query: {
          ...query,
          name: value
        }
      }));
    }
  };

  reset = () => {
    this.setState({searchValue: ''});
    const {dispatch, location: {pathname, query}} = this.props;
    dispatch(routerRedux.replace({
      pathname,
      query: {
        ...query,
        name: null
      }
    }));
  };

  render() {
    const {loading, list = [], total, dispatch, location = {}} = this.props;
    const {query = {}} = location;
    const title = '宿舍卡申请';
    const breadcrumb = ['宿舍卡管理', '宿舍卡申请'];
    const name = query.name || '';

    const searchProps = {
      className: styles['search'],
      placeholder: "请输入学生姓名搜索",
      enterButton: "搜索",
      size: "default",
      value: this.state.searchValue,
      onChange: (e) => {
        e.persist();
        this.setState({
          searchValue: e.target.value
        })
      },
      onSearch: value => {
        this.onSearch(value)
      }
    };

    const children = (
      <div className={styles["search-container"]}>
        <Input.Search {...searchProps}/>
        <Button onClick={this.reset}>重置</Button>
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
        width: 120,
        render: (text, record, index) => {
          return (
            <Row type="flex" align="middle">
              <Col span={8}>
                <img width={60} src={record.avatar}/>
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
        title: '宿舍号(床位)',
        key: 'dorm',
        width: 80,
        render: (text, record, index) =>
          `${record.buildingName}${record.layerName}${record.dormitoryName}(${record.bedName}床)`
      },
      {
        title: '备注',
        key: 'memo',
        width: 100,
      },
      {
        title: '申请时间',
        key: 'lastUpdated',
        width: 100,
        render: (text, record, index) => moment(record.lastUpdated).format('YYYY-MM-DD HH:mm')
      },
      {
        title: '申请教师',
        key: 'creatorName',
        width: 80,
      },
      {
        title: '状态',
        key: 'status',
        width: 80,
        render: (text, record, index) => {
          const status = record.status * 1;
          const id = record.id;
          const name = record.studentName;
          switch (status) {
            case 1:
              return (
                <Popconfirm
                  title={`确定为${name}开卡`}
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
                  <Button type={"primary"}>
                    未开卡
                  </Button>
                </Popconfirm>
              );
            case 2:
              return (
                <span>已开卡</span>
              );
            case 3:
              return (
                <span>已撤销</span>
              );
          }
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
        children={children}
        scrollHeight={275}
      >
      </ListPage>
    )
      ;
  }
}

