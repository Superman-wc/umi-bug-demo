import React, {Component, createRef} from 'react';
import classNames from 'classnames';
import styles from './answer.less';
import Placeholder from "./Placeholder";
import {html2text} from './helper';

const ContentEditable = Symbol('#AnswerEditor.ContentEditableArea');

export default class ContentEditableArea extends Component {

  constructor(props) {
    super(...arguments);
    this.state = {
      value: props.defaultValue,
      text: props.defaultValue ? html2text(props.defaultValue) : ''
    };
    this.ref = createRef();
  }

  componentDidMount() {
    const ele = document.createElement('div');
    ele.className = styles['html-input'];
    ele.innerHTML = this.state.value || '';
    ele.setAttribute('contentEditable', 'true');

    const handleKeyDown = (e) => {
      if ((e.code === "Minus") && e.altKey) {
        e.preventDefault();
        document.execCommand("insertHTML", false, `<u>　　　　　　　　　　</u>`);
        this.setState({value: ele.innerHTML, text: ele.innerText});
      }
      if ((e.code === "Minus") && e.ctrlKey) {
        document.execCommand('underline', false, null);
        this.setState({value: ele.innerHTML, text: ele.innerText});
      }
    };
    const handleKeyUp = () => this.setState({value: ele.innerHTML, text: ele.innerText});
    const handleInput = () => this.setState({value: ele.innerHTML, text: ele.innerText});
    const handlePaste = (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      this.setState({value: ele.innerHTML, text: ele.innerText});
    };
    const handleFocus = () => this.setState({focus: true});
    const handleBlur = () => this.setState({focus: false});
    const handleMouseDown = (e) => e.stopPropagation();

    ele.addEventListener('keydown', handleKeyDown, false);
    ele.addEventListener('keyup', handleKeyUp, false);
    ele.addEventListener('input', handleInput, false);
    ele.addEventListener("paste", handlePaste, false);
    ele.addEventListener('focus', handleFocus, false);
    ele.addEventListener('blur', handleBlur, false);
    ele.addEventListener('mousedown', handleMouseDown, false);

    this.ref.current.appendChild(ele);
    this[ContentEditable] = ele;
  }

  get value() {
    return this.state.innerHTML;
  }

  set value(value) {
    const ele = this[ContentEditable];
    ele.innerHTML = value;
    this.setState({value: ele.innerHTML, text: ele.innerText});
  }

  render() {
    const props = {
      ref: this.ref,
      className: classNames(
        styles['content-editable-area'],
        this.props.className,
        {
          [styles['focus']]: this.state.focus
        }
      ),
      onMouseMove: (e) => e.stopPropagation(),
    };
    const {children, placeholder} = this.props;
    const {text} = this.state;
    return (
      <div {...props}>
        {children}
        {
          placeholder && !text ?
            <Placeholder text={placeholder}/>
            :
            null
        }
      </div>
    )
  }
}
