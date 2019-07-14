import React, {Component} from 'react';
import withRouter from 'umi/withRouter';
import {LocaleProvider} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import styles from './index.less';

class App extends Component {

  componentDidCatch(error, info) {
    this.setState({hasError: true});
  }

  render() {
    const {location} = this.props;
    const {pathname} = location;

    if (pathname === '/login') {
      return this.props.children;
    }

    return (
      <LocaleProvider locale={zhCN}>
        <div className={styles['layout']}>

          <div className={styles['main']}>
            {this.props.children}
          </div>
        </div>
      </LocaleProvider>
    );
  }
}


export default withRouter(App);
