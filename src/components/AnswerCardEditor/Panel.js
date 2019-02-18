import React from 'react';
import styles from './Editor.less';
import classNames from 'classnames';

export default function Panel({header, children, footer, className, style}) {
  return (
    <section className={classNames(styles['editor-panel'], className)} style={style}>
      {
        header ?
          <header>{header}</header>
          :
          null
      }
      {
        children ?
          <main>{children}</main>
          :
          null
      }
      {
        footer ?
          <footer>{footer}</footer>
          :
          null
      }
    </section>
  )
}
