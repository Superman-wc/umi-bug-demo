import React, {Fragment, Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {Tooltip, Popover, Button} from 'antd';
import {StatusEnum} from "./interface";

export interface LectureStatusProps {
  status: number;
  prefixCls?: string;
  memo?: string;
}

export default class LectureStatus extends Component<LectureStatusProps, any> {

  static propTypes = {
    status: PropTypes.number,       // 代课，换课，
    prefixCls: PropTypes.string,
    memo: PropTypes.string,
  };

  render() {
    const {status, memo, prefixCls} = this.props;
    const className = classnames(`${prefixCls}-status`, `${prefixCls}-status-${status}`);
    return (
      <span className={className}>
      {
        status === StatusEnum.已取消 && memo ?
          <Tooltip title={memo}>
            <span>{StatusEnum[status]}</span>
          </Tooltip>
          :
          <span>{StatusEnum[status]}</span>
      }
      </span>
    );
  }
}
