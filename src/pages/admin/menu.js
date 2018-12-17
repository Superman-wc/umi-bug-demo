import React, {Component} from 'react';
import {connect} from 'dva';
import {AdminMenu as namespace, AdminUrlResource, Authenticate} from '../../utils/namespace';
import ListPage from '../../components/ListPage';
import {URLResourceCategoryEnum} from '../../utils/Enum';
import MenuModal from '../../components/MenuModal';
import TableCellOperation from '../../components/TableCellOperation';

@connect(state => ({
  total: state[namespace].total,
  list: state[namespace].list,
  loading: state[namespace].loading,
  profile: state[Authenticate].authenticate,
}))
export default class MenuList extends Component {

  state = {};

  componentDidMount() {
    const {dispatch, profile} = this.props;
    if(profile && profile.appId) {
      dispatch({
        type: namespace + '/list',
        payload: {
          appId: profile.appId,
        }
      })
    }
  }

  render() {

    const {list, total, loading, location, dispatch, profile:{appId}} = this.props;

    const title = '菜单列表';

    const breadcrumb = ['管理员', '菜单管理', title];

    const buttons = [
      {
        key: 'create', type: 'primary', children: '创建', title: '创建', icon: 'plus',
        onClick: () => {
          this.setState({visible: true, item: null});
          console.log('所有刷新菜单');
          dispatch({
            type: namespace + '/all',
            payload: {appId}
          })
          dispatch({
            type: AdminUrlResource + '/all',
            payload: {appId}
          })
        }
      }
    ];

    const columns = [
      {title: 'ID', key: 'id', width: 50,},
      {title: '名称', key: 'title', tac: false},
      {title: '链接', key: 'link', width: 300, tac: false},
      {title: '类别', key: 'category', /*render: v => URLResourceCategoryEnum[v]*/},
      {title: '分组', key: 'menuGroup',},
      {
        title: '操作', key: 'operation',
        render: (id, item) => (
          <TableCellOperation operations={{
            modify: () => this.setState({visible: true, item}),
            remove: {onConfirm: () => dispatch({type: namespace + '/remove', payload: {id}})}
          }}/>
        )
      }
    ];

    const listPageProps = {
      operations: buttons,
      location,
      loading:!!loading,
      columns, breadcrumb, list, total, title,
      pagination: true,
    };

    const menuModalProps = {
      visible: this.state.visible,
      appId,
      onCancel: () => this.setState({visible: false}),
      item: this.state.item,
      onOk: payload => {
        dispatch({
          type: namespace + (payload.id ? '/modify' : '/create'),
          payload,
          callback: () => this.setState({item: null, visible: false})
        })
      }
    };

    return (
      <ListPage {...listPageProps}>
        <MenuModal {...menuModalProps}/>
      </ListPage>
    );
  }
}

