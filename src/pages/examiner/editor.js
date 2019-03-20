import React from 'react';
// import dynamic from 'umi/dynamic';
import AnswerEditor from '../../components/AnswerEditor';

// const AnswerPage = dynamic({
//   loader: ()=>{
//     return new Promise(resolve=>{
//       import('../../components/AnswerEditor').then((AnswerEditor)=>{
//         resolve(()=>{
//           console.log('render AnswerEditor', AnswerEditor);
//           // 动态加载的组件注意
//           return (
//             <AnswerEditor.default />
//           );
//         });
//       })
//     })
//   }
// });

// export default AnswerPage;

export default function AnswerPage(props) {
  return (
    <AnswerEditor {...props}/>
  )
}
