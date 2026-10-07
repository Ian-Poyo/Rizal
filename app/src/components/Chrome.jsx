import React, { useEffect, useRef, useState } from 'react';
import shrink from '../files';
import { useStore } from '../store';
import {
  Home, HomeF, Search, Plus, Activity, ActivityF, User, UserF, Check, Send, Link, Trash,
  Close, Camera, Lock, Grid, Play, Tag, Chat, More, Verified, Bookmark, BookmarkF, Sun, Moon
} from '../Icons';

/* ---------------------------------------------------------------- status bar */
const clock = () =>
  new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(' ', '');

export function StatusBar() {
  const [t, setT] = useState(clock);
  useEffect(() => {
    const i = setInterval(() => setT(clock()), 15000);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="statusbar">
      <span>{t}</span>
      <span className="sb-right">
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
          <rect x="0" y="7.6" width="3" height="4.4" rx="1" fill="#fff" />
          <rect x="4.9" y="5.6" width="3" height="6.4" rx="1" fill="#fff" />
          <rect x="9.8" y="3.2" width="3" height="8.8" rx="1" fill="#fff" />
          <rect x="14.7" y="0.6" width="3" height="11.4" rx="1" fill="#fff" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden="true">
          <path d="M1 4.15a10.9 10.9 0 0 1 15 0" fill="none" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M3.85 7.05a6.9 6.9 0 0 1 9.3 0" fill="none" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M6.75 9.9a3 3 0 0 1 3.5 0" fill="none" stroke="#fff" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <svg width="26" height="12.5" viewBox="0 0 26 12.5" aria-hidden="true">
          <rect x="0.6" y="0.6" width="21.4" height="11.3" rx="3.4" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.1" />
          <rect x="2.3" y="2.3" width="16.4" height="7.9" rx="2.1" fill="#fff" />
          <path d="M23.9 4.4c.95.36 1.5.99 1.5 1.85s-.55 1.49-1.5 1.85V4.4Z" fill="rgba(255,255,255,.45)" />
        </svg>
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- dynamic island */
export function Island() {
  const { ui } = useStore();
  const live = !!ui.island;
  return (
    <div className={`island ${live ? 'live' : ''}`}>
      {live ? (
        <span className="live-txt">
          <span style={{ width: 7, height: 7, borderRadius: 99, background: '#ff4d6d', display: 'block' }} />
          {ui.island}
        </span>
      ) : null}
      <span className="lens" />
    </div>
  );
}

/* ---------------------------------------------------------------- toast */
export function Toast() {
  const { ui } = useStore();
  if (!ui.toast) return null;
  return (
    <div className={`toast ${ui.toast.kind || 'info'}`} key={ui.toast.id}>
      <span className="dot" />
      {ui.toast.msg}
    </div>
  );
}

/* ---------------------------------------------------------------- tab bar */
export function TabBar() {
  const { ui, go } = useStore();
  const t = ui.tab;
  const off = !!ui.overlay;
  return (
    <nav className="tabbar">
      <div className="tabs">
        <button className={`tab ${t === 'home' && !off ? 'on' : ''}`} onClick={() => go('home')}>
          {t === 'home' && !off ? <HomeF size={25} /> : <Home size={25} />}
          <span className="lb">Home</span>
        </button>

        <button className="tab" onClick={() => go('create')} aria-label="Create">
          <span className="icobox"><span className="createbtn"><Plus size={22} /></span></span>
          <span className="lb">Create</span>
        </button>

        <button className={`tab ${t === 'profile' && !off ? 'on' : ''}`} onClick={() => go('profile')}>
          {t === 'profile' && !off ? <UserF size={25} /> : <User size={25} />}
          <span className="lb">Profile</span>
        </button>
      </div>
      <span className="home-ind" />
    </nav>
  );
}

/* ---------------------------------------------------------------- generic sheet */
export function Sheet({ open, onClose, title, children, headRight, maxHeight }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="veil" onClick={onClose} />
      <div className="sheet" style={{ maxHeight: maxHeight || '92%' }}>
        <div className="grabber" />
        {title ? (
          <div className="sheet-head">
            <span className="t">{title}</span>
            {headRight || (
              <button className="iconbtn ghost" onClick={onClose} aria-label="Close"><Close size={18} /></button>
            )}
          </div>
        ) : null}
        <div className="sheet-body">{children}</div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- profile menu */
export function ProfileMenu({ open, onClose }) {
  const { resetDemo, share, uiSet, toggleTheme, data, unread } = useStore();
  return (
    <Sheet open={open} onClose={onClose} title="Options">
      <button className="menurow" onClick={() => { onClose(); uiSet({ editOpen: true }); }}>
        <Camera size={20} /><span>Edit profile<span className="sub">Name, handle, bio and link</span></span>
      </button>
      <button className="menurow" onClick={() => { onClose(); share('Nova — my profile'); }}>
        <Link size={20} /><span>Share profile<span className="sub">Copy a link to this page</span></span>
      </button>
      <button className="menurow" onClick={() => { onClose(); uiSet({ overlay: 'activity' }); }}>
        <Activity size={20} />
        <span>Activity
          <span className="sub">
            {unread > 0 ? `${unread} new — likes, comments and followers` : 'Likes, comments and followers'}
          </span>
        </span>
        {unread > 0 ? <span className="pill">{unread}</span> : null}
      </button>
      <button className="menurow" onClick={() => { onClose(); uiSet({ overlay: 'search' }); }}>
        <Search size={20} /><span>Search<span className="sub">Creators, tags and posts</span></span>
      </button>
      <button className="menurow" onClick={() => { toggleTheme(); }}>
        {data.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        <span>{data.theme === 'dark' ? 'Light mode' : 'Dark mode'}<span className="sub">Switch the whole app appearance</span></span>
      </button>
      <button className="menurow" onClick={() => { onClose(); resetDemo(); }}>
        <Trash size={20} /><span>Reset demo data<span className="sub">Restore the sample feed and counters</span></span>
      </button>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- edit profile */
export function EditProfile({ open, onClose }) {
  const { me, updateProfile } = useStore();
  const blank = {
    name: me.name, handle: me.handle, bio: me.bio, link: me.link || '',
    category: me.category || '',
    avatar: me.avatar, cover: me.cover,
    about: typeof me.about === 'string' ? me.about : '',
  };
  const [f, setF] = useState(blank);
  const avRef = useRef(null);
  const cvRef = useRef(null);
  useEffect(() => { if (open) setF(blank); }, [open]);

  // uploads: avatar is centre-cropped square, cover keeps its wide ratio
  const pickInto = (key, opts) => (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    shrink(file, opts).then((url) => {
      if (url) setF((prev) => ({ ...prev, [key]: url }));
    });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit profile"
      headRight={<button className="btn" style={{ height: 32, padding: '0 14px', color: 'var(--accent-text)', fontWeight: 700 }} onClick={() => {
        updateProfile(f);
        onClose();
      }}>Save</button>}
    >
      <div className="editrow">
        <span className="lbl">Photo</span>
        <button className="imgprev round" onClick={() => avRef.current.click()} aria-label="Change profile photo">
          <span className="in" style={{ backgroundImage: `url(${f.avatar})` }} />
        </button>
        <button className="imgbtn" onClick={() => avRef.current.click()}>Upload</button>
        <input ref={avRef} type="file" accept="image/*" hidden onChange={pickInto('avatar', { max: 512, square: true, quality: 0.8 })} />
      </div>
      <div className="editrow">
        <span className="lbl">Cover</span>
        <button className="imgprev wide" onClick={() => cvRef.current.click()} aria-label="Change cover photo">
          <span className="in" style={{ backgroundImage: `url(${f.cover})` }} />
        </button>
        <button className="imgbtn" onClick={() => cvRef.current.click()}>Upload</button>
        <input ref={cvRef} type="file" accept="image/*" hidden onChange={pickInto('cover', { max: 1200, quality: 0.75 })} />
      </div>
      <div className="editrow">
        <span className="lbl">Category</span>
        <span className="box"><input value={f.category} placeholder="e.g. Product design" onChange={(e) => setF({ ...f, category: e.target.value })} /></span>
      </div>
      <div className="editrow">
        <span className="lbl">Name</span>
        <span className="box"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></span>
      </div>
      <div className="editrow">
        <span className="lbl">Handle</span>
        <span className="box"><input value={f.handle} onChange={(e) => setF({ ...f, handle: e.target.value.replace(/[^\w.]/g, '') })} /></span>
      </div>
      <div className="editrow" style={{ alignItems: 'flex-start' }}>
        <span className="lbl" style={{ paddingTop: 12 }}>Bio</span>
        <span className="box" style={{ height: 'auto' }}>
          <textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
        </span>
      </div>
      <div className="editrow">
        <span className="lbl">Link</span>
        <span className="box"><input value={f.link} placeholder="yoursite.com" onChange={(e) => setF({ ...f, link: e.target.value })} /></span>
      </div>

      <div className="sec-label">About — description</div>
      <div className="editrow" style={{ alignItems: 'flex-start' }}>
        <span className="lbl" style={{ paddingTop: 12 }}>Description</span>
        <span className="box" style={{ height: 'auto' }}>
          <textarea
            value={f.about}
            placeholder="Tell people about yourself — family, work, where you live…"
            onChange={(e) => setF({ ...f, about: e.target.value })}
          />
        </span>
      </div>
      <div style={{ height: 26 }} />
    </Sheet>
  );
}
