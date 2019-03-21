import React, {Component} from 'react';
import PropTypes from 'prop-types';
import withRouter from 'umi/withRouter';
import Link from 'umi/link';
import {connect} from 'dva';
import {Tooltip, Icon, Spin, Menu, LocaleProvider} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import classnames from 'classnames';
import Flex from '../components/Flex';
import router from 'umi/router';
import {Authenticate as namespace, AnswerEditor} from '../utils/namespace';
import styles from './index.less';
import fundebug from 'fundebug-javascript';

import {MenuCategoryEnum, URLResourceCategoryEnum} from "../utils/Enum";


function MenuItemContent({link, title, onClick, min, resource = {}, dispatch}) {

  const _title = min ? title.substr(0, 2) : title;
  const _onClick = onClick || (() => {
    dispatch({
      type: namespace+'/set',
      payload:{
        currentResource: resource
      }
    });
    router.push(link);
  });
  const render = () => (
    <a href={"javascript:void('" + title + "');"} onClick={_onClick}>
      <span>{_title}</span>
    </a>
  );

  return min ?
    (
      <Tooltip placement="right" title={title}>
        {render()}
      </Tooltip>
    )
    :
    render()
}

function SideHeader() {
  return (
    <header className={styles['side-header']}>
      <Link to="/">
        <img
          className={styles['logo']}
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
  const {
    loading, user, defaultOpenKeys, openKeys = [], pathname, onOpenChange,
    menus = [], resources = [], isMin, onChange, dispatch,
  } = props;


  const resourceMap = resources.reduce((map, it) => {
    map[it.controllerName] = it;
    return map;
  }, {});


  const menuMap = menus && menus.reduce((map, it, index) => {
    const menuCategory = map[it.category] || {
      key: MenuCategoryEnum[it.category] || MenuCategoryEnum[URLResourceCategoryEnum[it.category]] || index,
      title: it.category,
      items: {}
    };
    const group = menuCategory.items[it.menuGroup] || {
      title: it.menuGroup || '--',
      items: []
    };
    it.resource = resourceMap[it.controllerName];
    group.items.push(it);
    menuCategory.items[it.menuGroup] = group;
    map[it.category] = menuCategory;
    return map;
  }, {}) || {};

  const menu = Object.keys(menuMap).reduce((arr, category) => {
    const menuCategory = menuMap[category];

    menuCategory.items = Object.keys(menuCategory.items).reduce((items, g) => {
      items.push(menuCategory.items[g]);
      return items;
    }, []);

    arr.push(menuCategory);
    return arr;
  }, []);

  console.log(menu);

  menu.push({
    key: 'examiner',
    title: '电子阅卷',
    items: [
      {
        title: '',
        items: [
          {
            id: 'examiner-list',
            title: '答题卡制做',
            link: '/examiner',
          }, {
            id: 'examiner-upload',
            title: '答题卡上传',
            link: '/examiner/upload'
          },
        ]
      }
    ]
  });


  return (
    <Flex direction="column" className={classnames(styles['side'], {[styles['min-side']]: isMin})}
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
                                <MenuItemContent {...item} min={isMin} dispatch={dispatch}/>
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
  menus: state[namespace].menus,
  resources: state[namespace].resources,
  loading: state[namespace].loading,
  admissionRebuildCheckList: state[namespace].admissionRebuildCheckList
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

  componentDidCatch(error, info) {
    this.setState({hasError: true});
    // 将component中的报错发送到Fundebug
    fundebug.notifyError(error, {
      metaData: {
        info: info
      }
    });
  }


  render() {

    const {loading, user, location} = this.props;
    const {pathname} = location;
    if (pathname === '/login' || pathname === AnswerEditor + '/editor') {
      return this.props.children;
    }

    const [, defaultOpenKeys] = pathname.split('/');
    const userSideProps = {
      defaultOpenKeys,
      openKeys: this.state.openKeys || [defaultOpenKeys],
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
