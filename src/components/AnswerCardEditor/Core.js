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
             }
           }}
      >
        <rect data-desc="光标" x="10" y="5" width="2" height="20" fill="#cd0000"/>
      </svg>
    )
  }
}
