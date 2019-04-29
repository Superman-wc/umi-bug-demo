import React, {Component} from 'react';
import styles from 'style.less';

export default class Index extends Component {

  componentDidMount() {
    const div = document.createElement('div');
    div.className = styles['image-preview'];
    const img = document.createElement('img');
    const {src} = this.props;
    img.addEventListener('load', (e) => {

    }, false);
    img.src = src;
    div.appendChild(img);
    document.body.appendChild(div);
    this.img = img;
    this.div = div;
  }

  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    if(nextProps.src!==this.props.src){
      this.img.src = nextProps.src;
    }
  }

  render() {
    return null;
  }

}
