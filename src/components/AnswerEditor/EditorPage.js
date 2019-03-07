import React, {Component, Fragment} from 'react';
import classNames from 'classnames';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import EditorColumn from './EditorColumn';
import QrCode from './QrCode';

export default function EditorPage(props) {
  const {index, page, file, ...columnProps} = props;
  const {dispatch, activePageKey} = columnProps;
  const style = {
    width: page.width,
    height: page.height,
    padding: page.padding.map(it => it + 'px').join(' '),
  };
  const className = classNames(styles['editor-page'], {
    [styles['active']]: activePageKey === page.key,
  });

  const qrCodeStyle = {
    top: page.padding[0] - 14,
    left: page.padding[3] - 14
  };

  const qrCode = file && file.id && file.ver ? `${file.id}#${file.ver}#${index}` : '';

  return (
    <div id={page.key} className={className} style={style} onClick={() => {
      dispatch({
        type: namespace + '/set',
        payload: {
          activePageKey: page.key,
        }
      });
    }}>

      {
        page.columns.map((column, index) =>
          <EditorColumn index={index} key={column.key} column={column} {...columnProps} />
        )
      }
      <QrCodeView style={qrCodeStyle} className={styles['qr-code']} value={qrCode}/>
      {
        file.pages.length > 1 ?
          <div className={styles['editor-page-code']}>第{index+1}页</div>
          :
          null
      }
    </div>
  )
}

class QrCodeView extends Component {

  constructor(props) {
    super(...arguments);
    this.state = {
      value: props.value || '智慧校园',
      src: null,
    }
  }

  componentDidMount() {
    QrCode(this.state.value).then((src) => {
      this.setState({src});
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (nextProps.value && nextProps.value !== this.state.value) {
      const {value} = nextProps;
      QrCode(value).then((src) => {
        this.setState({src, value});
      });
    }
  }


  render() {
    const {style, className} = this.props;
    const {value, src} = this.state;
    const imgProps = {
      style, className, src,
      role: 'box',
      'data-type': 'qr-code',
    };
    return (
      <Fragment>
        {
          this.state.src ?
            <img {...imgProps} alt={value}/>
            :
            null
        }
      </Fragment>
    )
  }

}

