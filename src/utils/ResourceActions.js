import {Enums, URLResourceEnum} from './Enum';

export const Actions = Enums(URLResourceEnum).map(it => {
  it.value = parseInt(it.value, 10);
  it.mask = it.value;
  // it.bit = uMask(it.value);
  return it;
});

