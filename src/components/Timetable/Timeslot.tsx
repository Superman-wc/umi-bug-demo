import React, {Fragment, Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {BaseComponentProps, MaxTimeslot} from "./interface";
import './style/Timeslot.less';

export interface BaseTimeslotProps {
  count: number
}

export type TimeslotProps = BaseTimeslotProps & BaseComponentProps;

export default class Timeslot extends Component<TimeslotProps, any> {
  static propTypes = {
    count: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    prefixCls: PropTypes.string,
  };

  static defaultProps = {
    prefixCls: 'timeslot-wrapper',
    count: MaxTimeslot
  };

  render() {
    const {
      count,
      prefixCls, className, style
    } = this.props;
    const components: Array<JSX.Element> = [];

    for (let i: number = 0; i < count; i++) {
      const props = {
        style,
        className: classnames(prefixCls, className, `${prefixCls}-${i}`)
      };
      components.push(<div key={i} {...props}>第{i + 1}节</div>)
    }

    return (
      <Fragment>
        {components}
      </Fragment>
    )
  }
}
