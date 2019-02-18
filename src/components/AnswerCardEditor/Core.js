import React, {Component, createRef, Fragment} from 'react';

import QrCode from './QrCode';

import {createOption, createUse} from "./common";


export default class Core extends Component {
  static CID = 0;

  id = 'AnswerCardEditorCore-' + Core.CID++;

  ref = createRef();

  state = {};


  get element() {
    return this.ref.current;
  }

  componentDidMount() {
    console.log(this.element);
    QrCode().then(qrcode => {
      this.setState({qrcode})
    });
    const option = createOption('A', {x: 400, y: 300});
    this.element.appendChild(option);

    const o = createUse('1', {x: 500, y: 600, width: 20, height: 10});
    this.element.appendChild(o);
    // this.element.innerHTML = '<g data-title="选择题1"><rect x="10" y="5" width="200" height="150" fill="#f86f86" /></g>'
  }

  isRoot(element) {
    return element.id === this.id;
  }

  render() {
    return (
      <svg id={this.id}
           ref={this.ref}
           style={{borderWidth: '1px', borderStyle: 'solid', borderColor: '#f00'}}
           width="100%" height="100%" version="1.1"
           viewBox="0 0 899 952"
           xmlns="http://www.w3.org/2000/svg"
           onMouseOver={(e) => {

           }}
           onClick={(e) => {
             if (this.isRoot(e.target)) {
               this.props.onSelectElement && this.props.onSelectElement(this.element, {isRoot: true});
             } else {
               this.props.onSelectElement && this.props.onSelectElement(e.target, {isRoot: false});
             }
           }}
      >
        <defs>
          <style>

          </style>
        </defs>
        <image href={this.state.qrcode} width="60" height="60" x="0" y="0"/>
        {
          [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(it =>
            <Option key={it} id={it}>{it}</Option>
          )
        }
        <StudentId/>

        <use href="#student-id" width="1000" height="1000" x="30" y="100"/>


        {/*<rect data-desc="光标" x="100" y="50" width="20" height="20" fill="#cd0000">*/}
        {/*/!*<animate attributeName="x" from="0" to="500" dur="2s" repeatCount="indefinite" />*!/*/}
        {/*</rect>*/}
        {/*<circle cx="100" cy="50" r="40" stroke="black" strokeWidth="2" fill="red"/>*/}
        {/*<ellipse cx="300" cy="150" rx="200" ry="80" fill="rgb(200,100,50)" stroke="rgb(0,0,100)" strokeWidth="2"/>*/}
        {/*<line x1="0" y1="0" x2="300" y2="300" stroke="#f00" strokeWidth="2" strokeDasharray="10"/>*/}
        {/*<polygon points="220,100 300,210 170,250" fill="#ccc" stroke="#000" strokeWidth="10"/>*/}
        {/*<polyline points="0,0 0,20 20,20 20,40 40,40 40,60" fill="#ccc" stroke="#000" strokeWidth="10"/>*/}
        {/*<path d="M153 334*/}
        {/*C153 334 151 334 151 334*/}
        {/*C151 339 153 344 156 344*/}
        {/*C164 344 171 339 171 334*/}
        {/*C171 322 164 314 156 314*/}
        {/*C142 314 131 322 131 334*/}
        {/*C131 350 142 364 156 364*/}
        {/*C175 364 191 350 191 334*/}
        {/*C191 311 175 294 156 294*/}
        {/*C131 294 111 311 111 334*/}
        {/*C111 361 131 384 156 384*/}
        {/*C186 384 211 361 211 334*/}
        {/*C211 300 186 274 156 274" fill="#ccc" stroke="#000" strokeWidth="10"/>*/}
        {/*<text x="400" y="500" fontSize="40" width="200" height="200" fill="#f00">*/}
        {/*中国人<tspan dy={10} fill="#00f">不打</tspan><tspan dy="-10">中国人</tspan>*/}
        {/*</text>*/}
        {/*<g>*/}
        {/*<text x="500" y="600">[ A ] [ B ] [ C ]</text>*/}
        {/*</g>*/}

      </svg>
    )
  }


}

function Option({id, children}) {
  return (
    <symbol id={id} viewBox="0 0 100 50">
      <rect width="100" height="50" stroke="#000" strokeWidth="3" fill="transparent"/>
      <text x="35" y="40" fontSize="40">{children}</text>

    </symbol>
  )
}

function StudentId() {
  const left=20;
  const top=150;
  const writeTop = top+10;
  const fillTop = writeTop + 40;

  const options = [];
  const colLines = [];
  for (let x = 0; x < 9; x++) {
    colLines.push(
      <line key={'line-' + x} x1={left + x * 200} y1={fillTop} x2={left + x * 200} y2="1490" stroke="#000" strokeWidth="1"
            strokeDasharray="10"/>
    );
    if(x<8) {
      for (let y = 0; y < 10; y++) {
        options.push(
          <Fragment key={x * 10 + y}>
            <rect x={70 + x * 200} y={fillTop+160 + y * 120} width="100" height="55" stroke="#000" strokeWidth="3"
                  fill="transparent"/>
            <text x={35 + 70 + x * 200} y={fillTop+205 + y * 120} fontSize="48">{y}</text>
          </Fragment>
        )
      }
    }
  }




  return (
    <symbol id="student-id" viewBox="0 0 2000 2000">
      <rect width="1640" height="1510" stroke="#000" strokeWidth="3" x="2" y="0" fill="#fff"/>
      <text x={left} y={top} fontSize="60">班级：</text>
      <line x1="180" y1={writeTop} x2="650" y2={writeTop} stroke="#000" strokeWidth="3"/>
      <text x="700" y={top} fontSize="60">姓名：</text>
      <line x1="860" y1={writeTop} x2="1620" y2={writeTop} stroke="#000" strokeWidth="3"/>

      <line x1={left} y1={fillTop} x2="1620" y2={fillTop} stroke="#000" strokeWidth="1" strokeDasharray="10"/>
      <line x1={left} y1={fillTop+100} x2="1620" y2={fillTop+100} stroke="#000" strokeWidth="1" strokeDasharray="10"/>
      <line x1={left} y1="1490" x2="1620" y2="1490" stroke="#000" strokeWidth="1" strokeDasharray="10"/>
      {colLines}
      {options}
    </symbol>
  )
}
