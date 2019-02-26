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
  return (
    <div className={styles['subjective-questions-box']}>
      <Score value={score}/>
      <main>
        {children}
      </main>
    </div>
  )
}
