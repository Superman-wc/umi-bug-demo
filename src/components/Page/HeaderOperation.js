import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'dva';
import {Link, routerRedux} from 'dva/router';
import {Button, Icon, Popconfirm, Popover, Tooltip} from 'antd';
import {Authenticate} from '../../utils/namespace';

@connect(state => ({
  user: state[Authenticate].authenticate,
}))
export default class HeaderOperation extends Component {
  static propTypes = {
    user: PropTypes.object,
    buttons: PropTypes.array,
  };

  render() {
    const {user, buttons = [], children, dispatch} = this.props;
    const defaultButtons = {
      edit: {
        title: '编辑',
        icon: 'edit',
        onClick: () => {
          console.error('没有实现的编辑操作');
        },
      },
      remove: {
        title: '删除',
        icon: 'cross-circle-o',
        confirm: '',
        onConfirm: () => {
          console.error('没有实现的删除操作');
        },
      },
      cancel: {
        title: '取消',
        icon: 'rollback',
        onClick: e => {
          e.preventDefault();
          dispatch(routerRedux.goBack());
        },
      },
      rollback: {
        title: '返回',
        icon: 'rollback',
        onClick: e => {
          e.preventDefault();
          dispatch(routerRedux.goBack());
        },
      },
      add: {
        title: '添加',
        icon: 'plus',
        onClick: () => {
          console.error('没有实现的添加操作');
        },
      },
      filter: {
        title: '筛选',
        icon: 'filter',
        onClick: () => {
          console.error('没有实现的筛选操作');
        },
      },
      save: {
        title: '保存',
        icon: 'save',
        onClick() {
          console.error('没有实现的保存操作');
        },
      },
    };
    const operations =
      buttons && buttons.length ? (
        <Button.Group>
          {buttons.map(button => {
            const props = {...defaultButtons[button.key], ...button};
            const title = props.title;
            const onConfirm = props.onConfirm;
            const confirm = props.confirm;

            if (!props.children) {
              props.children = title || props.key;
            }

            delete props.title;
            delete props.onConfirm;
            delete props.confirm;

            if (props.link) {
              const link = props.link;
              delete props.link;
              return (
                <Tooltip title={title} key={props.key + 'tooltip'}>
                  <Link to={link}>
                    <Button type="ghost" {...props} />
                  </Link>
                </Tooltip>
              );
            }
            const btn = (
              <Tooltip title={title} key={props.key + 'tooltip'}>
                <Button type="ghost" {...props} />
              </Tooltip>
            );

            return onConfirm ? (
              <Popconfirm
                title={confirm || '确定要删除吗？'}
                key={props.key + 'pop-confirm'}
                onConfirm={onConfirm}
              >
                {btn}
              </Popconfirm>
            ) : (
              btn
            );
          })}
        </Button.Group>
      ) : null;

    const handleExit = e => {
      e.preventDefault();
      dispatch({
        type: Authenticate + '/logout',
      });
    };

    const userOperations = user ? (
      <ul>
        <li>
          <a href="javascript:void('退出');" onClick={handleExit}>
            退出
          </a>
        </li>
        <li>
          <Link to="/my/modify-password">修改密码</Link>
        </li>
        {/*<li><Link to={'/my/' + user.id}>个人信息</Link></li>*/}
      </ul>
    ) : null;

    return (
      <div style={{textAlign: 'right'}}>
        {operations}
        {children}
        {
          userOperations ?
            <Popover content={userOperations}>
              <Button type="ghost" style={{marginLeft: '2em'}}>
                <Icon type="user"/>
                {user.nick || user.username}
              </Button>
            </Popover>
            :
            null
        }
      </div>
    );
  }
}
