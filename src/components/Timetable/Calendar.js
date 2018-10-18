import React from 'react';
import {routerRedux} from 'dva/router';
import {Icon} from 'antd';
import Flex from '../Flex';
import WeekIndex from './WeekIndex';
import styles from './index.less';

export default function Calendar({next, now, previous, dispatch, pathname, query}) {
  return (
    <Flex className={styles['calendar']}>
      <div className={styles['previous']} title="查看上一周" onClick={() => {
        dispatch(routerRedux.replace({pathname, query: {...query, weekIndex: previous.weekIndex}}));
      }}><Icon type="left" theme="outlined"/><WeekIndex value={previous && previous.weekIndex}/></div>
      <Flex.Item className={styles['now']} onClick={() => {
        dispatch(routerRedux.replace({pathname, query: {...query, weekIndex: now.weekIndex}}));
      }}><WeekIndex value={now && now.weekIndex}/></Flex.Item>
      <div className={styles['next']} title="查看下一周" onClick={() => {
        dispatch(routerRedux.replace({pathname, query: {...query, weekIndex: next.weekIndex}}));
      }}><WeekIndex value={next && next.weekIndex}/><Icon type="right" theme="outlined"/></div>
    </Flex>
  )
}
