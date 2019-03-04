import React from 'react';
import classNames from 'classnames';
import styles from './answer.less';
import {AnswerEditor as namespace} from "../../utils/namespace";
import EditorColumn from './EditorColumn';
import EditorElement from './EditorElement';

export default function EditorPage(props) {
  const {page, file, ...columnProps} = props;
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

  const elementsBoxStyle = {
    top: page.padding[0],
    right: page.padding[1],
    bottom: page.padding[2],
    left: page.padding[3]
  };

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
      {
        file && file.qrCode ?
          <QrCodeView style={qrCodeStyle} className={styles['qr-code']} src={file.qrCode}/>
          :
          null
      }

    </div>
  )
}

function QrCodeView(props){
  const imgProps = {
    ...props,
    role:'box',
    'data-type':'qr-code',
  };
  return (
    <img {...imgProps}/>
  )
}

