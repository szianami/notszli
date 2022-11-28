import stc from 'string-to-color';

export function getAvatar(name) {
  if (!name) return;

  let letters = name
    .split(' ')
    .map((item) => {
      return item[0];
    })
    .join('');

  let color = stc(name);
  return { letters, color };
}
