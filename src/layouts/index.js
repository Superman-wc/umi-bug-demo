import React, {Component} from 'react';
import PropTypes from 'prop-types';
import withRouter from 'umi/withRouter';
import Link from 'umi/link';
import {connect} from 'dva';
import {Tooltip, Icon, Spin, Menu, LocaleProvider} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import classnames from 'classnames';
import Flex from '../components/Flex';
import {TransitionGroup, CSSTransition} from "react-transition-group";
import {Authenticate as namespace} from '../utils/namespace';
import styles from './index.less';


function MenuItemContent({link, title, onClick, min}) {
  return min ? (
    <Tooltip placement="right" title={title}>
      {onClick ? (
        <a href={"javascript:void('" + title + "');"} onClick={onClick}>
          <span>{title.substr(0, 2)}</span>
        </a>
      ) : (
        <Link to={link}>
          <span>{title.substr(0, 2)}</span>
        </Link>
      )}
    </Tooltip>
  ) : onClick ? (
    <a href={"javascript:void('" + title + "');"} onClick={onClick}>
      <span>{title}</span>
    </a>
  ) : (
    <Link to={link}>
      <span>{title}</span>
    </Link>
  );
}

function SideHeader() {
  return (
    <header className={styles['side-header']}>
      <Link to="/">
        <img
          className={styles['logo']}
          src={require('./images/logo-80-01.png')}
          title="布谷科技"
          alt="布谷科技"
        />
      </Link>
    </header>
  );
}

function Bars({onChange, isMin}) {
  return (
    <a className={styles['menu-handle']} onClick={() => onChange(!isMin)}>
      <Icon type="bars"/>
    </a>
  )
}

function SideFooter({isMin}) {
  if (isMin) {
    return null;
  }

  return (
    <footer className={styles['side-footer']}>
      &copy;杭州布谷科技有限公司
    </footer>
  );
}

function Side(props) {
  const {loading, user, defaultOpenKeys, openKeys = [], pathname, onOpenChange, menu, isMin, onChange} = props;

  return (
    <Flex direction="column" className={classnames(styles['side'], {[styles['min-side']]: isMin})}>
      <SideHeader/>
      <Flex.Item className={styles['side-main']}>
        <Bars onChange={onChange} isMin={isMin}/>
        <Spin spinning={!!loading}>
          {
            // user && user.token ?
              <Menu
                mode="inline"
                defaultOpenKeys={[defaultOpenKeys]}
                defaultSelectedKeys={[pathname]}
                onOpenChange={openKeys => onOpenChange(openKeys.length ? [openKeys.pop()] : [])}
                openKeys={openKeys}
              >
                {
                  menu.map(submenu => (
                    <Menu.SubMenu
                      key={submenu.key}
                      title={
                        isMin ?
                          <Tooltip placement="right" title={submenu.title}>
                            <div className="ant-menu-submenu-title-div"/>
                          </Tooltip>
                          :
                          submenu.title
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
                                  <MenuItemContent {...item} min={isMin}/>
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
      <SideFooter isMin={isMin}/>
    </Flex>
  );
}

const UserSide = connect(state => ({
  user: state[namespace].authenticate,
}))(Side);


class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  state = {
    minSide: false,
  };


  render() {

    const {loading, user, location} = this.props;

    const {pathname} = location;

    if (pathname === '/login') {
      return this.props.children;
    }


    const menu = [
      {
        key: 'manages',
        title: '管理',
        items: [
          {
            items: [
              {
                link: '/manages/school',
                title: '学校管理'
              },
              {
                link: '/manages/grade',
                title: '年级管理',
              },
              {
                link: '/manages/class',
                title: '班级管理',
              },
              {
                link: '/manages/student',
                title: '学生管理',
              },
              {
                link: '/manages/teacher',
                title: '师资管理',
              },
              {
                link: '/manages/course',
                title: '课程管理',
              }
            ]
          }
        ],
      },
      {
        key: 'timetable',
        title: '排课',
        items: [
          {
            title: '',
            items: [
              {
                link: '/timetable/grade',
                title: '年级课表'
              },
              {
                link: '/timetable/class',
                title: '班级课表',
              },
              {
                link: '/timetable/teacher',
                title: '教师课表',
              },
              {
                link: '/timetable/student',
                title: '学生课表',
              }
            ]
          }
        ],
      },
      {
        key: 'other',
        title: '其他',
        items: [
          {
            title: '',
            items: [
              {
                link: '/manages/meter',
                title: '个人中心'
              },
              {
                link: '/manages/user',
                title: '常见问题',
              },
              {
                link: '/manages/price',
                title: '下载中心',
              }
            ]
          }
        ],
      },
    ];

    const [, defaultOpenKeys] = pathname.split('/');

    console.log('defaultOpenKeys=', defaultOpenKeys, 'this.state.openKeys=', this.state.openKeys);

    const userSideProps = {
      defaultOpenKeys,
      openKeys: this.state.openKeys || [defaultOpenKeys],
      menu,
      loading, user, pathname,
      onOpenChange: openKeys => this.setState({openKeys}),
      isMin: this.state.minSide,
      onChange: minSide => this.setState({minSide})
    };

    return (
      <LocaleProvider locale={zhCN}>
        <Flex>
          <UserSide {...userSideProps}  />
          <Flex.Item className={styles['main']}>
            {/*<TransitionGroup>*/}
            {/*<CSSTransition key={location.key} classNames="fade" timeout={300}>*/}
            {this.props.children}
            {/*</CSSTransition>*/}
            {/*</TransitionGroup>*/}
          </Flex.Item>
        </Flex>
      </LocaleProvider>
    );
  }
}


export default withRouter(App);
