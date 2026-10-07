/**
 * Turn a File from an <input type="file"> into a small JPEG data URL that is
 * safe to persist in localStorage.
 *
 *   const url = await shrink(file, { max: 900, quality: 0.72 });
 *   const square = await shrink(file, { max: 400, square: true });   // avatars
 *
 * Resolves to null if the file is not a readable image.
 */
export default function shrink(file, { max = 900, quality = 0.72, square = false } = {}) {
  return new Promise((resolve) => {
    if (!file || !/^image\//.test(file.type)) { resolve(null); return; }

    const fr = new FileReader();
    fr.onerror = () => resolve(null);
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(null);
      img.onload = () => {
        let sw = img.width, sh = img.height, sx = 0, sy = 0;
        if (square) {                       // centre-crop to a square first
          const s = Math.min(sw, sh);
          sx = (sw - s) / 2; sy = (sh - s) / 2; sw = sh = s;
        }
        const k = Math.min(1, max / Math.max(sw, sh));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(sw * k));
        c.height = Math.max(1, Math.round(sh * k));
        c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/* pick a file without leaving a stray input in the DOM */
export function pickImage() {
  return new Promise((resolve) => {
    const el = document.createElement('input');
    el.type = 'file';
    el.accept = 'image/*';
    el.onchange = () => resolve(el.files && el.files[0]);
    el.click();
  });
}
