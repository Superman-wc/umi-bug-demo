export default function FileInput() {
  const {onChange, children, onDropChange, dropEnabled = true, multiple = true} = props;
  const fileInputProps = {
    type: 'file',
    onChange
  };
  if (dropEnabled && onDropChange) {
    fileInputProps.onDragEnter = () => onDropChange(true);
    fileInputProps.onDragLeave = () => onDropChange(false);
    fileInputProps.onDrop = onChange;
  }
  if (multiple) {
    fileInputProps.multiple = 'multiple';
  }
  return (

    <div className='ant-btn'>
      {children}
      <input {...fileInputProps}/>
    </div>

  );
}
