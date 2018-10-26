import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Moment from 'moment';
import {WEEK, INow, BaseComponentProps} from "./interface";
import './style/WeekOfDate.less';


export interface BaseWeekOfDateProps {
  now?: INow,
  index: number
}

export type WeekOfDateProps = BaseWeekOfDateProps & BaseComponentProps;

export default class WeekOfDate extends Component<WeekOfDateProps> {
  static propTypes = {
    now: PropTypes.object,
    index: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    prefixCls: PropTypes.string,
  };

  static defaultProps = {
    prefixCls: 'week-of-date-wrapper',
  };

  render() {
    const {
      now, index,
      prefixCls, className, style,
    } = this.props;
    const week = `星期${WEEK[index]}`;
    const {startTime} = now || {startTime: Moment().startOf('isoWeek').valueOf()};
    const date = new Date(startTime + 3600 * 1000 * 24 * index);
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const props = {
      style,
      className: classnames(prefixCls, className)
    };
    return (
      <div {...props}>
        <span>{week}</span>
        <span>{`${m}月${d}日`}</span>
      </div>
    );
  }
}
