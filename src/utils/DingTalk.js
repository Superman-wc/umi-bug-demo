import fetch from 'dva/fetch';

export class DingTalkMessage {
  text;
  title;
  image;
}

export default class DingTalk {

  static Message = DingTalkMessage;

  static URL = 'https://oapi.dingtalk.com/robot/send?access_token=4883b5b8a2e3cad50024ef61b55dbee50ea7af428c28c244f457ad3ec0ccab93';

  static Send(message) {
    const url = DingTalk.URL;
    const data = {};
    if(message.image){
      data.text = `# ${message.title}\n${message.text}\n![](${message.image})`;
      data.title = message.title;
      data.msgtype = 'markdown';
    }else{
      data.msgtype = 'text';
      data.text = message.text;
    }
    const opt = {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(data)
    };
    return fetch(url, opt);
  }
}
