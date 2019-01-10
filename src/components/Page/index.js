import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Breadcrumb, Icon, Spin, Menu, Modal } from 'antd';
import classnames from 'classnames';
import Operation from './HeaderOperation';
import Flex from '../Flex';
import './Page.less';

const prefixCls = 'page-wrapper';

export default function Page({ children, header, footer, loading ,className, mainClassName}) {
  return (
    <Spin spinning={!!loading}>
      <Flex direction="column" className={classnames(prefixCls, className)}>
        {header}
        <Flex isItem direction="column" className={classnames(prefixCls + '-main', mainClassName)}>
          {children}
        </Flex>
        {footer}
      </Flex>
    </Spin>
  );
}

Page.propTypes = {
  header: PropTypes.any,
  footer: PropTypes.any,
  loading: PropTypes.bool,
};

Page.Header = function({ breadcrumb, title, operation, children, className, style, menu }) {
  if (title && window.document.title != title) {
    //只在标题不相同的时候设置
    window.document.title = title;
  }
  const _className = classnames(prefixCls + '-header', className);
  const map = {};

  return (
    <Flex className={_className} justify="space-around" align="middle" style={style}>
      <div className={prefixCls + '-header-title'}>
        <h1 title={title}>{title}</h1>
        <Flex style={{alignItems:'center'}}>
          <Icon type="heart" />
          <Breadcrumb>{renderBreadcrumb(breadcrumb)}</Breadcrumb>
        </Flex>
      </div>
      <Flex.Item className={prefixCls + '-header-main'}>{children}</Flex.Item>
      {menu ? (
        <Menu
          selectable={false}
          style={{ position: 'relative', zIndex: 100, borderBottom: 0 }}
          mode="horizontal"
          onClick={({ item, key, keyPath }) => {
            console.log(item, key, keyPath);
            const func = map[key];
            func && func();
          }}
        >
          {renderMenu(menu, map)}
        </Menu>
      ) : null}
      {operation}
    </Flex>
  );
};

Page.Header.propType = {
  breadcrumb: PropTypes.array,
  title: PropTypes.string,
  operation: PropTypes.object,
  menu: PropTypes.array,
};

Page.Header.Operation = Operation;

const renderMenu = (data, map) =>
  data.map((menu, index) => {
    if (menu.onClick) {
      map[menu.key] = menu.onClick;
    } else if (menu.exec) {
      map[menu.key] = menu.exec;
    } else if (menu.confirm) {
      map[menu.key] = () => {
        Modal.confirm(menu.confirm);
      };
    }

    if (menu.subMenu) {
      return (
        <Menu.SubMenu
          key={menu.key}
          disabled={menu.disabled}
          title={
            <span>
              {menu.icon ? <Icon type={menu.icon} /> : null}
              {menu.title || menu.children || menu.key}
            </span>
          }
        >
          {renderMenu(menu.subMenu, map)}
        </Menu.SubMenu>
      );
    } else if (menu.group) {
      return (
        <Menu.ItemGroup
          title={
            <span>
              {menu.icon ? <Icon type={menu.icon} /> : null}
              {menu.title || menu.children || menu.key}
            </span>
          }
        >
          {renderMenu(menu.group, map)}
        </Menu.ItemGroup>
      );
    } else if (menu.divider) {
      return <Menu.Divider key={menu.key || index} />;
    } else {
      return (
        <Menu.Item key={menu.key} disabled={menu.disabled}>
          {menu.icon ? <Icon type={menu.icon} /> : null}
          {menu.title || menu.children || menu.key}
        </Menu.Item>
      );
    }
  });

function renderBreadcrumb(breadcrumb) {
  return breadcrumb && breadcrumb.length
    ? breadcrumb.map((b, i) => <Breadcrumb.Item key={i}>{b}</Breadcrumb.Item>)
    : null;
}

Page.Footer = function(props) {
  const className = classnames(prefixCls + '-footer', props.className);
  return <footer {...{ ...props, className }} />;
};
