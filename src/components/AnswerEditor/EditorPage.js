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

  const [top, right, bottom, left] = page.padding;

  const qrCodeStyle = {
    top: top - 14,
    left: left - 14
  };

  const pointLeftStyle = {
    left,
    bottom: bottom,
  };

  const pointRightStyle = {
    right,
    bottom: bottom,
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
          <div className={styles['editor-page-code']} style={{bottom: bottom - 16}}>第{index + 1}页</div>
          :
          null
      }
      <div role="box" data-type="point"
           className={styles['editor-page-position-point']}
           style={pointLeftStyle}/>
      <div role="box" data-type="point"
           className={classNames(styles['editor-page-position-point'], styles['right'])}
           style={pointRightStyle}/>
      <div className={styles['editor-page-warning']} style={{left: left - 25}}>请不要在答题区外书写或涂抹 ，保持页面干净整洁</div>
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

