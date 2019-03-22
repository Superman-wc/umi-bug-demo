import React, {Component, createRef} from 'react';
import classNames from 'classnames';
import styles from './answer.less';
import Placeholder from "./Placeholder";
import {html2text, text2html} from './helper';
import {upload} from './Uploader';

const ContentEditable = Symbol('#AnswerEditor.ContentEditableArea');

export default class ContentEditableArea extends Component {

  static focusComponent = null;
  static CID = 0;
  static instances = {};
  static focusEventListen = false;
  static focusEventListener = (e)=>{
    console.log('autoFocusContentEditableArea',e);
    if(ContentEditableArea.focusComponent){
      ContentEditableArea.focusComponent.focus();
    }
  };
  static addFocusEventListen(){
    if(!ContentEditableArea.focusEventListen){
      document.addEventListener('autoFocusContentEditableArea', ContentEditableArea.focusEventListener, false);
      ContentEditableArea.focusEventListen = true;
    }
  }

  static removeFocusEventListen(){
    if(ContentEditableArea.focusEventListen && !Object.keys(ContentEditableArea.instances).length){
      document.removeEventListener('autoFocusContentEditableArea', ContentEditableArea.focusEventListener, false);
      ContentEditableArea.focusEventListen = false;
    }
  }

  constructor(props) {
    super(...arguments);
    this.id = 'ContentEditableArea-' + ContentEditableArea.CID++;
    const value = props.value || props.defaultValue || '';
    this.state = {
      value: value,
      text: value ? html2text(value) : ''
    };
    this.ref = createRef();

    ContentEditableArea.instances[this.id] = this;

  }

  componentWillUnmount(){
    delete ContentEditableArea.instances[this.id];
    ContentEditableArea.removeFocusEventListen();
  }

  componentDidMount() {

    ContentEditableArea.addFocusEventListen();

    const ele = document.createElement('div');
    ele.className = styles['html-input'];
    ele.innerHTML = this.state.value || '';
    ele.setAttribute('contentEditable', 'true');

    const handleKeyDown = (e) => {

      if ((e.code === "Minus") && e.altKey) {
        e.preventDefault();
        document.execCommand("insertHTML", false, `<u>　　　　　　　　　　　　</u>`);
        this.setState({value: ele.innerHTML, text: ele.innerText});
      }
      else if ((e.code === "Minus") && e.ctrlKey) {
        e.preventDefault();
        document.execCommand('underline', false, null);
        this.setState({value: ele.innerHTML, text: ele.innerText});
      }
      else if(e.code ==='Space' && e.altKey){
        e.preventDefault();
        document.execCommand("insertHTML", false, '&emsp;&emsp;');
        this.setState({value: ele.innerHTML, text: ele.innerText});
      }
      else if(e.code ==='Space' && e.shiftKey){
        e.preventDefault();
        document.execCommand("insertHTML", false, '<u>　　　　　　　　　　　　</u>');
        this.setState({value: ele.innerHTML, text: ele.innerText});
      }
      else if(e.code ==='Space'){
        e.preventDefault();
        document.execCommand("insertText", false, '　');
        this.setState({value: ele.innerHTML, text: ele.innerText});
      }
    };
    const handleKeyUp = () => {
      if (ele.innerHTML !== this.state.innerHTML) {
        this.setState({value: ele.innerHTML, text: ele.innerText});
        this.props.onChange && this.props.onChange({value: ele.innerHTML, text: ele.innerText});
      }
    };
    const handleInput = () => this.setState({value: ele.innerHTML, text: ele.innerText});
    const handlePaste = (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      this.setState({value: ele.innerHTML, text: ele.innerText});
    };
    const handleFocus = () => {
      this.setState({focus: true});
      ContentEditableArea.focusComponent = this;
    };
    const handleBlur = () => {
      this.setState({focus: false});
      ContentEditableArea.focusComponent = null;
    };
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

  UNSAFE_componentWillReceiveProps(nextProps, nextContent) {
    if (nextProps.value && nextProps.value !== this.state.value) {
      const value = nextProps.value ? text2html(nextProps.value) : nextProps.value;
      const ele = this[ContentEditable];
      console.log(value);
      ele.innerHTML = value;
      this.setState({value: ele.innerHTML, text: ele.innerText});
    }
  }

  focus = () => {
    // const event = document.createEvent('FocusEvent');
    // event.initEvent('focus', true, true);
    // document.dispatchEvent(event);
    this.setState({focus: true});
    this[ContentEditable].focus();
  };

  render() {
    const {children, placeholder, allowDragUpload, uploadConfig, className} = this.props;
    const {text} = this.state;
    const props = {
      id: this.id,
      ref: this.ref,
      className: classNames(
        styles['content-editable-area'],
        className,
        {
          [styles['focus']]: this.state.focus,
          [styles['drag']]: this.state.drag,
        }
      ),
      onMouseMove: (e) => e.stopPropagation(),
      onDrop: (e) => {
        e.preventDefault();
        const fileList = e.dataTransfer.files;
        console.log(fileList);
        this.setState({drag: false});
        if (fileList && allowDragUpload) {
          upload(e, uploadConfig);
        }
      },
      onDragOver: (e) => {
        e.preventDefault();
        this.setState({drag: true});
      }
    };


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
