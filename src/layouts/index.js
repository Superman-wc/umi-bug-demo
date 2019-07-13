import React, {Component, Fragment} from 'react';

import withRouter from 'umi/withRouter';
import Link from 'umi/link';
import {connect} from 'dva';
import {Icon, Spin, Menu, LocaleProvider, Popover} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import classNames from 'classnames';
import Flex from '../components/Flex';
import router from 'umi/router';
import {Authenticate as namespace, AnswerEditor, Env} from '../utils/namespace';
import styles from './index.less';


import {addClass, removeClass} from "../utils/dom";


const ICON_MAP = {
  '管理': styles['icon-guanli'],
  '管理员': styles['icon-admin'],
  '排课': styles['icon-paike'],
  '考务管理': styles['icon-kaowu'],
  '选班排课': styles['icon-fenban'],
  '考勤': styles['icon-kaoqin'],
  '文印管理': styles['icon-wenyin'],
  '电子阅卷': styles['icon-yuejuan']
};


function MenuItemContent({menu}) {

  const {link, title, onClick,} = menu;
  const _onClick = onClick || (() => {
    router.push(link);
  });
  return (
    <a href={"javascript:void('" + title + "');"} onClick={_onClick}>
      <span>{title}</span>
    </a>
  )

}

function SideHeader() {
  return (
    <header className={styles['side-header']}>
      <Link to="/">
        <img className={styles['logo']}
             src="https://res.yunzhiyuan100.com/smart-campus/logo-white.png"
             title="布谷科技"
             alt="布谷科技"
        />
      </Link>
    </header>
  );
}

function Bars({onChange, isMin}) {
  return (
    <a className={styles['menu-handle']} onClick={() => {
      onChange(!isMin);
    }}>
      <Icon type="bars"/>
    </a>
  )
}

function SideFooter({isMin, inElectron, user, dispatch}) {

  if (inElectron && user) {
    return (
      <footer className={styles['side-footer']}>
        <Popover placement="rightBottom" title={`用户：${user.nick || user.username}`} content={
          <ul>
            {/*<li>*/}
            {/*  <Link to="/my/modify-password">修改密码</Link>*/}
            {/*</li>*/}
            <li>
              <a onClick={() => {
                dispatch({type: namespace + '/logout'})
              }}>退出</a>
            </li>
          </ul>
        }>
          <a className={styles['user-menu']}>{user.nick}</a>
        </Popover>
      </footer>
    );
  }

  if (!isMin) {
    return (
      <footer className={styles['side-footer']}>
        &copy;杭州布谷科技有限公司
      </footer>
    )
  }

  return <Fragment/>;
}


function Side(props) {
  const {
    env,
    loading, user, defaultOpenKeys, openKeys = [], pathname, onOpenChange,
    isMin, onChange, dispatch,
    menuTree = [],
  } = props;

  console.log('defaultOpenKeys=',defaultOpenKeys, 'openKeys=',openKeys);

  return (
    <Fragment>
      <Flex direction="column"
            className={classNames(styles['side'], {[styles['min-side']]: isMin})}
            onTransitionEnd={(e) => {
              if (e.propertyName === 'width') {
                const event = document.createEvent('HTMLEvents');
                event.initEvent('resize', true, true);
                window.dispatchEvent(event);
              }
            }}>
        <SideHeader/>
        <Flex.Item className={styles['side-main']}>
          <Bars onChange={onChange} isMin={isMin}/>
          <Spin spinning={!!loading}>
            {
              // user && user.token ?
              <Menu
                mode={isMin ? "vertical" : "inline"}
                defaultOpenKeys={[defaultOpenKeys]}
                defaultSelectedKeys={[pathname]}
                onOpenChange={openKeys => onOpenChange(openKeys.length ? [openKeys.pop()] : [])}
                openKeys={openKeys}
              >
                {
                  menuTree.map(submenu => (
                    <Menu.SubMenu
                      key={submenu.key}
                      title={
                        <span
                          className={classNames(styles['menu-submenu'], ICON_MAP[submenu.title])}>{submenu.title}</span>
                      }
                    >
                      {
                        submenu.items.map((menus, mi) =>
                          <Menu.ItemGroup
                            key={'menu-item-group-' + submenu.key + '-' + mi}
                            title={menus.title}
                          >
                            {
                              menus.items.map((item) => (
                                <Menu.Item key={item.link || item.key} id={item.link}>
                                  <MenuItemContent menu={item} min={isMin} dispatch={dispatch}/>
                                </Menu.Item>
                              ))
                            }
                          </Menu.ItemGroup>
                        )
                      }
                    </Menu.SubMenu>
                  ))}
              </Menu>
              // :
              // null
            }
          </Spin>
        </Flex.Item>
        <SideFooter isMin={isMin} {...env} user={user} dispatch={dispatch}/>
      </Flex>
    </Fragment>
  );
}

const UserSide = connect(state => ({
  user: state[namespace].authenticate,
  menuTree: state[namespace].menuTree,
  resources: state[namespace].resources,
  loading: state['loading'].models[namespace],
  admissionRebuildCheckList: state[namespace].admissionRebuildCheckList,
  env: state[Env],
}))(Side);


class App extends Component {
  state = {
    minSide: true,
  };

  componentDidCatch(error, info) {
    this.setState({hasError: true});
    // 将component中的报错发送到Fundebug
    window.fundebug && window.fundebug.notifyError(error, {
      metaData: {
        info: info
      }
    });
  }

  componentDidMount() {
    this.setDocumentElementClassName();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.setDocumentElementClassName();
  }

  setDocumentElementClassName = () => {
    if (this.state.minSide) {
      addClass(document.documentElement, 'side-small');
    } else {
      removeClass(document.documentElement, 'side-small');
    }
  };


  render() {

    const {loading, user, location, env} = this.props;
    const {pathname} = location;
    if (pathname === '/login' || pathname === AnswerEditor + '/editor') {
      return this.props.children;
    }

    const [, defaultOpenKeys] = pathname.split('/');
    const userSideProps = {
      defaultOpenKeys,
      openKeys: this.state.openKeys,
      loading, user, pathname,
      onOpenChange: openKeys => this.setState({openKeys}),
      isMin: this.state.minSide,
      onChange: minSide => this.setState({minSide})
    };

    return (
      <LocaleProvider locale={zhCN}>
        <div className={styles['layout']}>
          <UserSide {...userSideProps}  />
          <div className={styles['main']}>
            {this.props.children}
          </div>
        </div>
      </LocaleProvider>
    );
  }
}


export default withRouter(App);
