import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { PHOTO_POOL } from '../data';
import { Camera, Plus, Close, Grid, Play } from '../Icons';

import shrink from '../files';

export default function Create() {
  const { addPost, me, toast } = useStore();
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [kind, setKind] = useState('post');
  const fileRef = useRef(null);
  const ready = !!media;

  const reset = () => { setMedia(null); setCaption(''); setTags(''); setLocation(''); setKind('post'); };

  const share = () => {
    if (!media) { toast('Add a photo first'); return; }
    const parsed = [
      ...tags.split(/[\s,]+/).map((t) => t.replace(/^#/, '')).filter(Boolean),
      ...[...caption.matchAll(/#([\w-]+)/g)].map((m) => m[1]),
    ];
    addPost({
      media,
      caption: caption.replace(/#[\w-]+/g, '').trim(),
      tags: [...new Set(parsed)],
      kind,
      location,
    });
    reset();
  };

  return (
    <>
      <header className="appbar">
        <div style={{ flex: 1, textAlign: 'left', fontSize: 18, fontWeight: 700, letterSpacing: '-.45px' }}>New post</div>
        {ready ? (
          <button className="iconbtn ghost" onClick={reset} aria-label="Clear"><Close size={18} /></button>
        ) : null}
      </header>

      <div className="scroller">
        <div className="composer">
          <div
            className={`dropzone ${ready ? 'has' : ''}`}
            onClick={() => (ready ? fileRef.current.click() : null)}
          >
            {media ? <img src={media} alt="" /> : null}
            {!ready ? (
              <div className="dz-inner">
                <Camera size={30} style={{ color: '#6b7284' }} />
                <div style={{ fontSize: 14, fontWeight: 650, color: '#cfd5e1' }}>Choose a photo</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  Pick one from your library below<br />or upload from this device
                </div>
              </div>
            ) : null}
            {ready ? (
              <div className="dz-overlay">
                <span className="dzbadge">{kind === 'reel' ? 'Reel' : 'Post'} · 1 photo</span>
              </div>
            ) : null}
          </div>

          <div className="row" style={{ padding: 0, marginTop: 12, justifyContent: 'space-between' }}>
            <div className="kindtoggle">
              <button className={kind === 'post' ? 'on' : ''} onClick={() => setKind('post')}><Grid size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />Post</button>
              <button className={kind === 'reel' ? 'on' : ''} onClick={() => setKind('reel')}><Play size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />Reel</button>
            </div>
            <button className="chipbtn" onClick={() => fileRef.current.click()}>Upload</button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (!f) return;
              shrink(f).then((d) => (d ? setMedia(d) : toast('Could not read that image')));
              e.target.value = '';
            }}
          />

          <div className="sec-head" style={{ padding: '18px 0 8px' }}>
            <span className="t">Your library</span>
            <span className="m">{PHOTO_POOL.length} photos</span>
          </div>
          <div className="picker">
            {PHOTO_POOL.map((p) => (
              <button
                key={p.id}
                className={`pcell ${media === p.src ? 'on' : ''}`}
                onClick={() => setMedia(p.src)}
              >
                <img src={p.src} alt={p.label} />
              </button>
            ))}
          </div>

          <div className="field">
            <div className="fieldbox">
              <textarea
                placeholder="Write a caption…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <div className="fieldbox" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#6b7284', fontSize: 14 }}>#</span>
              <input
                placeholder="Add tags, separated by spaces"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <div className="fieldbox" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#6b7284', fontSize: 14 }}>⌖</span>
              <input
                placeholder="Add a location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="row" style={{ padding: 0, marginTop: 16, gap: 12 }}>
            <span className="av" style={{ width: 34, height: 34, backgroundImage: `url(${me.avatar})`, display: 'block' }} />
            <div style={{ textAlign: 'left', fontSize: 12.5, color: '#6b7284', lineHeight: 1.4 }}>
              Posting as <b style={{ color: '#9ba2b2' }}>@{me.handle}</b><br />
              {kind === 'reel' ? 'Shows in Reels and your profile' : 'Shows in your feed and profile grid'}
            </div>
          </div>
        </div>

        <div className="submitbar">
          <button
            className="btn primary"
            style={{ width: '100%', opacity: ready ? 1 : .5 }}
            onClick={share}
          >
            {ready ? 'Share' : 'Select a photo to share'}
          </button>
        </div>
      </div>
    </>
  );
}
