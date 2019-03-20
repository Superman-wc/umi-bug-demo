import React from 'react';
import styles from './answer.less';
import {Score} from "./Score";

/**
 * 主观题
 * @param children
 * @param score
 * @returns {*}
 * @constructor
 */
export default function SubjectiveQuestionsBox({children, score = 1}) {
  const props = {
    role:'box',
    'data-type':'subjective-question',
  };
  return (
    <div className={styles['subjective-questions-box']}>
      <Score value={score}/>
      <main {...props}>
        {children}
      </main>
    </div>
  )
}
