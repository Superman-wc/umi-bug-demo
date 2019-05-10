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

import {MenuCategoryEnum, URLResourceCategoryEnum} from "../utils/Enum";
import resourceActions from '../utils/ResourceActions';

import {addClass, removeClass} from "../utils/dom";


import icon_guanli from '../assets/icon/1@2x.png'; //guanli.svg
import icon_admin from '../assets/icon/2@2x.png'; //admin.svg
import icon_paike from '../assets/icon/3@2x.png'; //fenban.svg
import icon_kaowu from '../assets/icon/4@2x.png'; //kaoqin.svg
import icon_fenban from '../assets/icon/5@2x.png'; //kaowu.svg
import icon_kaoqin from '../assets/icon/6@2x.png'; //paike.svg
import icon_wenyin from '../assets/icon/7@2x.png'; //wenyin.svg
import icon_yuejuan from '../assets/icon/8@2x.png'; //yuejuan.svg

const ICON_MAP = {
  '管理': icon_guanli,
  '管理员': icon_admin,
  '排课': icon_paike,
  '考务管理': icon_kaowu,
  '选班排课': icon_fenban,
  '考勤': icon_kaoqin,
  '文印管理': icon_wenyin,
  '电子阅卷': icon_yuejuan
};


function MenuItemContent({menu, min, resource = {}, dispatch}) {

  const {link, title, onClick,} = menu;

  const _title = min ? title.substr(0, 2) : title;
  const _onClick = onClick || (() => {
    router.push(link);
  });
  const render = () => (
    <a href={"javascript:void('" + title + "');"} onClick={_onClick}>
      <span>{_title}</span>
    </a>
  );

  // return min ?
  //   (
  //     <Tooltip placement="right" title={title}>
  //       {render()}
  //     </Tooltip>
  //   )
  //   :
  //   render()
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
    menuTree = [],
  } = props;


  return (
    <Flex direction="column"
          className={classnames(styles['side'], {[styles['min-side']]: isMin})}
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
                      // isMin ?
                      //   <Tooltip placement="right" title={submenu.title}>
                      //     <div className="ant-menu-submenu-title-div"/>
                      //   </Tooltip>
                      //   :
                      <span className={styles['menu-submenu']}
                            style={{backgroundImage: 'url(' + ICON_MAP[submenu.title] + ')'}}>{submenu.title}</span>
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
      <SideFooter isMin={isMin}/>
    </Flex>
  );
}

const UserSide = connect(state => ({
  user: state[namespace].authenticate,
  menuTree: state[namespace].menuTree,
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
