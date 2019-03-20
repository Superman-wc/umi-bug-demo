import React, {Component} from 'react';
import {connect} from 'dva';
import {AdminUrlResource as namespace, Authenticate} from '../../utils/namespace';
import ListPage from '../../components/ListPage';
import UrlResourceModal from '../../components/UrlResource/UrlResourceModal';


import {Actions} from '../../utils/ResourceActions';

function resourceActions(mask) {
  return Actions.reduce((arr, action) => {

    if ((mask & action.mask) === action.mask) {
      arr.push({label: action.name, value: action.mask});
    }
    return arr;
  }, []);
}

@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  profile: state[Authenticate].authenticate,
}))
export default class UrlResourceList extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, profile} = this.props;
    if (profile && profile.appId) {
      dispatch({
        type: namespace + '/list',
        payload: {
          appId: profile.appId,
        }
      })
    }
  }

  render() {

    const {list, total, loading, location, dispatch} = this.props;

    const title = 'URL资源列表';

    const breadcrumb = ['管理员', 'URL资源管理', title];

    const buttons = [];

    const columns = [
      {title: 'ID', key: 'id', width: 40,},
      {title: '类别', key: 'category',/* tac: false, *//*render: v => URLResourceCategoryEnum[v]*/},
      {title: '描述', key: 'description', width: 100, tac: false,},
      {title: 'Controller', key: 'controllerName', width: 180, tac: false},
      {
        title: 'Action', key: 'actionMask', width: 200, tac: false,
        render: mask => resourceActions(mask).map(ra =>
          <span key={ra.value} style={{marginRight: '1em'}}>{ra.label}</span>
        )
      },
      {title: '创建时间', key: 'dateCreated'},
      // {title: '状态', key: 'status', render: v => EnableStatusEnum[v] || '默认'},
      // {
      //   title: '操作', dataIndex: 'id', key: 'operate', width: 50,
      //   render: (id, item) => <TableCellOperation operations={{modify: () => this.setState({item, visible: true})}}/>
      // }
    ];

    return (
      <ListPage operations={buttons} location={location} loading={!!loading}
                columns={columns} breadcrumb={breadcrumb}
                list={list} total={total} pagination title={title}
      >
        <UrlResourceModal item={this.state.item}
                          onCancel={() => this.setState({visible: false})}
                          visible={this.state.visible}
                          onOk={payload => {
                            dispatch({
                              type: namespace + '/modify',
                              payload,
                              callback: () => this.setState({item: {}, visible: false})
                            });
                          }}
        />
      </ListPage>
    );
  }
}

