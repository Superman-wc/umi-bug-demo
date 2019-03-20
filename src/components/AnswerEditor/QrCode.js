import QrCode from 'qrcode';

export default function (str = '智慧校园') {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    QrCode.toCanvas(canvas, str, function (error) {
      if (error) {
        reject(error);
      } else {
        console.log('build QrCode success!');
        resolve(canvas.toDataURL());
      }
    });
  })
}
