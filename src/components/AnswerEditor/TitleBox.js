import React from 'react';
import styles from './answer.less';
import Element from "./Element";
import ContentEditableArea from "./ContentEditableArea";

export default function TitleBox({value = {}, ...props}) {
  return (
    <Element  {...props} className={styles['title-box']} element={value}>
      <ContentEditableArea placeholder="请输入标题" defaultValue={value.title} />
    </Element>
  )
}
