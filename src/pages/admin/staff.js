import React, {Component} from 'react';
import {Switch, Input, message} from 'antd';
import {connect} from 'dva';
import ListPage from '../../components/ListPage';
import {AdminStaff as namespace, Authenticate} from '../../utils/namespace';
import StaffModal from '../../components/StaffModal';
import AllotAuthorityModal from '../../components/AllotAuthorityModal';
import TableCellOperation from '../../components/TableCellOperation';

@connect(state => ({
  list: state[namespace].list,
  total: state[namespace].total,
  lading: state[namespace].loading,
  profile: state[Authenticate].authenticate,
}))
export default class StaffList extends Component {

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

    let {list, total, loading, location, dispatch, profile} = this.props;

    const {query} = location;

    const breadcrumb = ['管理员', '操作员管理', '操作员列表'];

    const title = '操作员列表';

    const buttons = [
      {
        key: 'create', type: 'primary', children: '创建', title: '创建', icon: 'plus',
        onClick: () => {
          this.setState({visible: true, item: null})
        }
      }
    ];


    const columns = [
      {title: 'ID', key: 'id', width:60,},
      {title: '手机号', key: 'mobile', width: 150},
      {title: '昵名', key: 'nick', width: 150,},
      {
        title: '角色', key: 'authorities', width: 'auto', tac: false,
        render: v => v && v.length && (v.find(it => it.id === 'ROLE_APPADMIN') ? '超级管理员' : v.map(it => it.description).join(',') || '')
      },
      {
        title: '状态', key: 'status', width: 130,
        render: (status, item) =>
          (item.authorities && item.authorities.find(it => it.id === 'ROLE_APPADMIN')) ?
            '--'
            :
            <Switch checkedChildren={'已启用'}
                    unCheckedChildren={'已禁用'}
                    defaultChecked={!!status}
                    onChange={checked =>
                      dispatch({
                        type: namespace + '/modify',
                        payload: {
                          id: item.id,
                          status: checked ? 1 : 0
                        }
                      })
                    }
            />
      },
      {
        title: '操作', key: 'operation', width: 150,
        render: (id, item) =>
          (item.authorities && item.authorities.find(it => it.id === 'ROLE_APPADMIN')) ?
            '--'
            :
            <TableCellOperation operations={{
              authority: {
                children: '角色',
                onClick: () => this.setState({allotAuthorityModalVisible: true, item})
              },
              modify: () => this.setState({visible: true, item}),
              remove: {onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}})}

            }}/>
      }
    ];

    const listPageProps = {
      operations: buttons,
      loading: !!loading,
      pagination: true,
      location, columns, breadcrumb, list, total, title,
      headerChildren: (
        <div style={{width: 300}}>
          <Input.Search
            placeholder="请输入手机号或用户名"
            onSearch={value => {
              message.error('暂未实现');
              // dispatch({
              //   type: namespace + '/list',
              //   payload: {
              //     ...query,
              //     mobile: value,
              //     username: value,
              //     p: 1,
              //     appId: profile.appId,
              //   }
              // })
            }}
            enterButton
          />
        </div>
      ),
      onChange: (pagination, filters, sorter) => {
      let _query = { ...query };
      Object.keys(filters).forEach(key => {
        if (filters[key].length) {
          _query[key] = filters[key].join(',');
        } else {
          delete _query[key];
        }
      });
      _query.p = pagination.current;
      _query.s = pagination.pageSize;

        if (profile && profile.appId) {
          dispatch({
            type: namespace + '/list',
            payload: {
              appId: profile.appId,
              ..._query,
            }
          })
        }

      return {};
    }
    };

    const staffModalProps = {
      appId: profile && profile.appId,
      visible: this.state.visible,
      item: this.state.item,
      onCancel: () => this.setState({visible: false}),
      onOk: payload => {
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          resolve: () => this.setState({visible: false})
        });
      }
    };

    const allotAuthorityModalProps = {
      appId: profile && profile.appId,
      visible: this.state.allotAuthorityModalVisible,
      item: this.state.item,
      onCancel: () => this.setState({allotAuthorityModalVisible: false}),
      onOk: payload => {
        dispatch({
          type: namespace + '/modify',
          payload,
          resolve: () => this.setState({
            allotAuthorityModalVisible: false,
            item: null
          })
        })
      }
    };

    return (
      <ListPage {...listPageProps}>
        <StaffModal {...staffModalProps} />
        {
          this.state.item ?
            <AllotAuthorityModal {...allotAuthorityModalProps}/>
            :
            null
        }
      </ListPage>

    );
  }
}

