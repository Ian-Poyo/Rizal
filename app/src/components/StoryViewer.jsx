import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore, timeAgo, buzz } from '../store';
import { Close, Send, Heart, Trash } from '../Icons';

const DUR = 5000;

/* One viewer for both story rings and profile highlights. */
export default function StoryViewer() {
  const { ui, uiSet, byId, data, share, deleteHighlight, me, markSeen } = useStore();
  const v = ui.viewer;
  const barsRef = useRef([]);
  const raf = useRef(0);
  const paused = useRef(false);
  const [i, setI] = useState(0);

  /* build the slide list for whichever surface opened the viewer */
  const show = useMemo(() => {
    if (!v) return null;
    const owner = byId[v.owner];

    if (v.kind === 'story') {
      const at = data.stories.findIndex((s) => s.userId === v.id);
      if (at < 0) return null;
      // continuous playback: start at this creator, then continue through the rail
      const ordered = [...data.stories.slice(at), ...data.stories.slice(0, at)];
      return {
        owner, kind: 'story', title: null, meta: null,
        slides: ordered.map((st) => ({
          media: st.media, ownerId: st.userId, createdAt: st.createdAt, caption: st.caption,
        })),
      };
    }

    const hl = (data.highlights[v.owner] || []).find((h) => h.id === v.id);
    if (!hl) return null;
    return {
      owner, kind: 'highlight', title: hl.title,
      meta: `${hl.items.length} ${hl.items.length === 1 ? 'photo' : 'photos'}`,
      /* a highlight photo may carry its own line of text: either a bare image
         (uploads, and highlights built from your own posts) or { media, caption } */
      slides: hl.items.map((m) => (
        typeof m === 'string'
          ? { media: m, caption: '' }
          : { media: m.media, caption: m.caption || '' }
      )),
    };
  }, [v, byId, data]);

  /* rewind whenever a new viewer session opens */
  useEffect(() => { setI(v ? (v.index || 0) : 0); }, [v && v.kind, v && v.id, v && v.owner]);

  /* opening a story marks it seen; advancing marks the next creator too */
  useEffect(() => {
    if (!show || show.kind !== 'story') return;
    const cur = show.slides[i];
    if (cur) markSeen(cur.ownerId);
  }, [show && show.kind, i]);

  /* island pill while playing */
  useEffect(() => {
    if (show) {
      uiSet({ island: show.kind === 'highlight' ? `Highlight · ${show.title}` : 'Viewing story' });
      return () => uiSet({ island: null });
    }
  }, [!!show, show && show.title]);

  const total = show ? show.slides.length : 0;

  function close() {
    cancelAnimationFrame(raf.current);
    uiSet({ viewer: null });
  }
  function next() {
    if (i < total - 1) { setI(i + 1); buzz(6); } else close();
  }
  function prev() { if (i > 0) setI(i - 1); }

  /* progress driver — writes bar widths directly to avoid re-rendering each frame */
  useEffect(() => {
    if (!show) return;
    let elapsed = 0;
    let last = performance.now();
    const step = () => {
      const now = performance.now();
      if (!paused.current) elapsed += now - last;
      last = now;
      const p = Math.min(1, elapsed / DUR);
      const bars = barsRef.current.slice(0, total);
      bars.forEach((b, k) => {
        if (!b) return;
        b.style.width = k < i ? '100%' : k === i ? p * 100 + '%' : '0%';
      });
      if (p >= 1) { next(); return; }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [show && show.title, total, i]);

  if (!show) return null;
  const slide = show.slides[Math.min(i, total - 1)];
  const { kind } = show;
  const owner = byId[slide.ownerId] || show.owner;
  const meta = kind === 'story' ? timeAgo(slide.createdAt) : `${show.slides.length} ${show.slides.length === 1 ? 'photo' : 'photos'}`;

  return (
    <div className="storyview">
      {/* the same image, blurred, fills the frame; the image itself is never cropped */}
      <span className="sv-bg" style={{ backgroundImage: `url(${slide.media})` }} key={'bg' + slide.media + i} />
      <img className="full" src={slide.media} alt="" key={slide.media + i} />
      <div className="sv-scrim" />

      <div className="sv-bars">
        {show.slides.map((_, k) => (
          <i key={k}><span className="fill" ref={(el) => (barsRef.current[k] = el)} /></i>
        ))}
      </div>

      <div className="sv-top">
        <span className="av" style={{ width: 36, height: 36, backgroundImage: `url(${owner.avatar})`, display: 'block' }} />
        <span style={{ flex: 1, textAlign: 'left' }}>
          <span className="nm" style={{ display: 'block' }}>{kind === 'highlight' ? show.title : owner.handle}</span>
          <span className="wh">{kind === 'highlight' ? `${owner.handle} · ${meta}` : meta}</span>
        </span>
        {kind === 'highlight' && v.owner === me.id ? (
          <button className="cvbtn" onClick={() => deleteHighlight(v.id)} aria-label="Delete highlight"><Trash size={17} /></button>
        ) : null}
        <button className="cvbtn" onClick={close} aria-label="Close"><Close size={18} /></button>
      </div>

      <div className="sv-tapzone" style={{ left: 0 }}
        onPointerDown={() => (paused.current = true)}
        onPointerUp={() => { paused.current = false; prev(); }}
        onPointerLeave={() => (paused.current = false)} />

      <div className="sv-tapzone" style={{ right: 0 }}
        onPointerDown={() => (paused.current = true)}
        onPointerUp={() => { paused.current = false; next(); }}
        onPointerLeave={() => (paused.current = false)} />

      <div className="sv-caption">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 1 }}>
            {slide.caption ? <><b style={{ fontWeight: 650 }}>{slide.caption}</b><br /></> : null}
            {kind === 'highlight' ? `${show.title} · ` : ''}
            {i + 1} of {total} — tap either side to move through.
          </span>
          <button className="cvbtn" onClick={() => share(kind === 'highlight' ? `${show.title} highlight` : `@${owner.handle} story`)}>
            <Send size={17} />
          </button>
          <button className="cvbtn" onClick={() => buzz(12)}><Heart size={18} /></button>
        </div>
      </div>
    </div>
  );
}
