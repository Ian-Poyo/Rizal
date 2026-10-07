import { useEffect, useRef } from 'react';

/**
 * Drag a horizontal scroller with a mouse / trackpad (click-and-drag) and give
 * it a little momentum on release. Touch keeps the native swipe, so the hook
 * bows out for pointerType === 'touch'.
 *
 * Notes that cost us a bug once:
 *  - No pointer capture. Capturing on pointerdown re-targets the following
 *    `click` to the scroller, so a plain tap on a child button never fired.
 *    We track the drag on window listeners instead.
 *  - A real drag swallows the click that follows it, so dragging across a rail
 *    never opens a story or highlight by accident.
 */
export default function useDragScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let active = false;
    let startX = 0;
    let startLeft = 0;
    let moved = 0;
    let vx = 0;
    let lastX = 0;
    let lastT = 0;
    let raf = 0;

    const stopGlide = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onDown = (e) => {
      if (e.pointerType === 'touch') return;   // native swipe on touch
      if (e.button !== 0) return;
      stopGlide();
      active = true;
      moved = 0;
      vx = 0;
      startX = lastX = e.clientX;
      startLeft = el.scrollLeft;
      lastT = performance.now();
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };

    const onMove = (e) => {
      if (!active) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > moved) moved = Math.abs(dx);
      if (moved > 4) {
        el.classList.add('dragging');
        if (e.cancelable) e.preventDefault();
      }
      el.scrollLeft = startLeft - dx;

      const now = performance.now();
      vx = (e.clientX - lastX) / Math.max(1, now - lastT);   // px per ms
      lastX = e.clientX;
      lastT = now;
    };

    const onUp = () => {
      if (!active) return;
      active = false;
      el.classList.remove('dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);

      let v = vx * 16;
      if (Math.abs(v) < 1.2) return;
      const glide = () => {
        v *= 0.93;
        if (Math.abs(v) < 0.5) { raf = 0; return; }
        el.scrollLeft -= v;
        raf = requestAnimationFrame(glide);
      };
      raf = requestAnimationFrame(glide);
    };

    // swallow the click that follows a drag (capture phase, so children can't
    // see it first) — a drag must never activate the item it started on
    const onClickCapture = (e) => {
      if (moved > 6) {
        moved = 0;
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      stopGlide();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  return ref;
}
