import React, {Component} from 'react';
import {Switch} from 'antd';
import {connect} from 'dva';
import {AdminAuthority as namespace, Authenticate} from '../../utils/namespace';
import ListPage from '../../components/ListPage';
import AuthorityModal from '../../components/AuthorityModal';
import UrlResourceTree from '../../components/UrlResource/UrlResourceTree';
import TableCellOperation from '../../components/TableCellOperation';
import {EnableStatusEnum} from '../../utils/Enum';
import {isInternalAuthority, isAdminAuthority} from "../../utils/helper";


@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  item: state[namespace].item,
  profile: state[Authenticate].authenticate || {},
}))
export default class AuthorityList extends Component {

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

    const {
      list, total, loading, item,
      location, dispatch, profile
    } = this.props;

    const {appId} = profile;

    const title = '角色列表';

    const breadcrumb = ['管理员', '角色管理', title];

    const buttons = [
      {
        key: 'create', type: 'primary', children: '创建', title: '创建', icon: 'plus',
        onClick: () => this.setState({visible: true, item: {status: EnableStatusEnum.禁用}})
      }
    ];


    const columns = [
      {title: '角色ID', key: 'name', width: 150, tac: false},
      {title: '名称', key: 'description', width: 100, tac: false},
      {title: '创建时间', key: 'dateCreated'},
      {
        title: '状态', key: 'status',
        render: (status, item) =>
          isInternalAuthority(item.id, appId) ?
            '默认'
            :
            <Switch checkedChildren={'已启用'} unCheckedChildren={'已禁用'}
                    checked={status * 1 === EnableStatusEnum.启用}
                    onChange={checked =>
                      dispatch({
                        type: namespace + '/modify',
                        payload: {
                          id: item.id,
                          appId: item.appId,
                          status: checked ? EnableStatusEnum.启用 : EnableStatusEnum.禁用
                        }
                      })
                    }
            />
      },
      {
        title: '操作', key: 'operation', width: 120, tac: false,
        render: (id, item) => (
          <TableCellOperation operations={{
            allot: (!isAdminAuthority(id, appId)) ? () => {
              dispatch({
                type: namespace + '/item',
                payload: {id, appId},
                resolve: () => {
                  this.setState({urlResourceTreeVisible: true});
                }
              });
            } : null,
            modify: isInternalAuthority(id, appId) ? null : () => this.setState({visible: true, item}),
            remove: isInternalAuthority(id, appId) ? null : {
              onConfirm: () => dispatch({
                type: namespace + '/remove',
                payload: {id}
              })
            }
          }}/>
        )
      }
    ];

    const listPageProps = {
      location, columns, breadcrumb, list, total, title,
      operations: buttons,
      loading: !!loading,
      pagination: true,
    };

    const authorityModalProps = {
      appId,
      item: this.state.item,
      visible: this.state.visible,
      onCancel: () => this.setState({visible: false}),
      onOk: payload => dispatch({
        type: namespace + (payload.id ? '/modify' : '/create'),
        payload,
        resolve: () => this.setState({item: {}, visible: false})
      })
    };

    const urlResourceTreeProps = {
      appId,
      visible: this.state.urlResourceTreeVisible,
      onCancel: () => this.setState({urlResourceTreeVisible: false}),
      onOk: payload => {
        payload = {...item, ...payload};
        delete payload.dateCreated;
        dispatch({
          type: namespace + '/modify',
          payload,
          resolve: () => this.setState({urlResourceTreeVisible: false, item: {}})
        })
      }
    };

    return (
      <ListPage {...listPageProps}>
        <AuthorityModal {...authorityModalProps}/>
        <UrlResourceTree {...urlResourceTreeProps} />
      </ListPage>
    );
  }
}

