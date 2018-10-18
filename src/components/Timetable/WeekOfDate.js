import React, {Fragment, Component} from 'react';
import {routerRedux} from 'dva/router';
import classnames from "classnames";
import {Radio, Icon, Menu, Dropdown, Modal} from 'antd';
import Flex from '../Flex';
import styles from './index.less';


const WEEK = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

export default function WeekOfDate({now, index}) {
  const week = WEEK[index];
  const {startTime} = now || {};
  const date = new Date(startTime + 3600 * 1000 * 24 * index);
  // const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return (
    <div style={{lineHeight: 1.5}}>
      <div>{week}</div>
      <div>{`${m}月${d}日`}</div>
    </div>
  )
}
