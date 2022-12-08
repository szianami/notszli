import stc from 'string-to-color';

export function getAvatar(name) {
  if (!name) return { letters: '', color: '' };

  let letters = name
    .split(' ')
    .map((item) => {
      return item[0];
    })
    .join('');

  letters = letters.toUpperCase();

  let color = stc(name);
  return { letters, color };
}
