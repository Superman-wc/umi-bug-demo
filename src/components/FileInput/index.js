import styles from './index.less';

export default function FileInput(props) {
  const {className, style, onChange, children, onDropChange, selectFileEnable = true, dropEnabled = true, multiple = true} = props;

  const handleChange = (e) => {
    const files = (e.dataTransfer && e.dataTransfer.files) || e.target.files;
    onChange(files);
    e.preventDefault();
    e.stopPropagation();
  };

  const fileInputProps = {
    type: 'file',
    onChange: handleChange,
    title: '',
    alt: ''
  };

  if (multiple) {
    fileInputProps.multiple = 'multiple';
  }

  const _props = {
    className: [styles['file-input'], className].join(' '),
    style,
  };
  if (dropEnabled && onDropChange) {
    _props.onDragEnter = () => onDropChange(true);
    _props.onDragLeave = () => onDropChange(false);
    _props.onDrop = handleChange;
  }

  return (

    <div {..._props}>
      {children}
      {
        selectFileEnable ?
          <input {...fileInputProps}/>
          :
          null
      }
    </div>

  );
}
