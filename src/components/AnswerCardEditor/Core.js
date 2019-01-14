import React, {Component, createRef} from 'react';

export default class Core extends Component {
  static CID = 0;

  id = 'AnswerCardEditorCore-' + Core.CID++;

  ref = createRef();

  get element() {
    return this.ref.current;
  }

  componentDidMount() {
    console.log(this.element);
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
        <rect data-desc="光标" x="100" y="50" width="20" height="20" fill="#cd0000">
          {/*<animate attributeName="x" from="0" to="500" dur="2s" repeatCount="indefinite" />*/}
        </rect>
        <circle cx="100" cy="50" r="40" stroke="black" strokeWidth="2" fill="red"/>
        <ellipse cx="300" cy="150" rx="200" ry="80" fill="rgb(200,100,50)" stroke="rgb(0,0,100)" strokeWidth="2"/>
        <line x1="0" y1="0" x2="300" y2="300" style={{stroke: 'rgb(99,99,99)', strokeWidth: 2}}/>
        <polygon points="220,100 300,210 170,250" fill="#ccc" stroke="#000" strokeWidth="10"/>
        <polyline points="0,0 0,20 20,20 20,40 40,40 40,60" fill="#ccc" stroke="#000" strokeWidth="10"/>
        <path d="M153 334
C153 334 151 334 151 334
C151 339 153 344 156 344
C164 344 171 339 171 334
C171 322 164 314 156 314
C142 314 131 322 131 334
C131 350 142 364 156 364
C175 364 191 350 191 334
C191 311 175 294 156 294
C131 294 111 311 111 334
C111 361 131 384 156 384
C186 384 211 361 211 334
C211 300 186 274 156 274" fill="#ccc" stroke="#000" strokeWidth="10"/>
        <text x="400" y="500" fontSize="40" width="200" height="200" fill="#f00">
          中国人<tspan dy={10} fill="#00f">不打</tspan><tspan dy="-10">中国人</tspan>
        </text>
        <g>
          <text x="500" y="600">[ A ] [ B ] [ C ]</text>
        </g>
        <image href="https://res.yunzhiyuan100.com/smart-campus/logo-white.png"
               width="50%" height="50%"/>
      </svg>
    )
  }
}

export const TagAttributes = {
  text: {fontSize: {type:'number'}},
};

