import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore, num, compact } from '../store';
import { Sheet } from '../components/Chrome';
import { PostTile } from '../components/Post';
import { PHOTO_POOL } from '../data';
import useDragScroll from '../useDragScroll';
import shrink from '../files';
import {
  Back, Send, More, Grid, Play, Tag, BookmarkF, Verified, Chat, Check, Plus, Moon, Sun
} from '../Icons';

export default function Profile({ userId }) {
  const {
    me, byId, data, uiSet, postsOf, reelsOf, savedPosts, taggedPosts, postCount,
    myFollowingCount, highlightsOf, toggleFollow, toggleTheme, viewHighlight,
    addHighlight, back, share, toast
  } = useStore();

  const user = byId[userId] || me;
  const isMe = user.id === me.id;
  const following = !!data.following[user.id];

  const [tab, setTab] = useState('posts');
  const [msgOpen, setMsgOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [hlOpen, setHlOpen] = useState(false);
  const [hlTitle, setHlTitle] = useState('');
  const [hlPicks, setHlPicks] = useState([]);
  const hlUpRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const scroller = useRef(null);
  const hlRef = useDragScroll();

  useEffect(() => {
    setTab('posts'); setMsg('');
  }, [userId]);

  const highlights = highlightsOf(user.id);
  const about = typeof user.about === 'string' ? user.about : '';

  const grid = useMemo(() => (
    tab === 'posts' ? postsOf(user.id)
      : tab === 'reels' ? reelsOf(user.id)
        : tab === 'saved' ? savedPosts
          : taggedPosts
  ), [tab, user.id, postsOf, reelsOf, savedPosts, taggedPosts]);

  const emptyMsg = {
    posts: ['No posts yet', isMe ? 'Share your first photo from the plus button.' : 'When they post, it shows up here.'],
    reels: ['No reels yet', 'Short videos will appear here.'],
    saved: ['Nothing saved', 'Tap the bookmark on any post to collect it here.'],
    tagged: ['No tagged posts', 'Posts that tag this account appear here.'],
  }[tab];

  const stats = {
    posts: postCount(user),
    followers: user.followers,
    following: isMe ? myFollowingCount : user.following,
  };

  const togglePick = (src) => setHlPicks((p) => p.includes(src) ? p.filter((x) => x !== src) : [...p, src]);

  // photos straight from the device can be highlights too, not just your posts
  const onHlUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    shrink(file, { max: 900, quality: 0.75 }).then((url) => {
      if (url) setHlPicks((p) => [...p, url]);
      else toast('Could not read that image');
    });
  };

  const createHighlight = () => {
    if (!hlPicks.length) { toast('Pick at least one photo'); return; }
    addHighlight(hlTitle || 'Highlights', hlPicks);
    setHlOpen(false); setHlTitle(''); setHlPicks([]);
  };

  return (
    <>
      <div
        className="scroller full no-pad"
        ref={scroller}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 132)}
        style={{ paddingBottom: 'calc(var(--tabbar) + 28px)' }}
      >
        <div className="cover">
          <img src={user.cover} alt="" />
          <div className="scrim" />
        </div>

        <div className="prof">
          <div className="prof-top">
            <div className="pfp">
              <div className="in" style={{ backgroundImage: `url(${user.avatar})` }} />
            </div>
          </div>

          <div className="prof-name">
            {user.name}
            {user.verified ? <Verified size={17} /> : null}
            {user.pro && <span className="chip"><Verified size={12} style={{ color: 'currentColor' }} />Pro</span>}
          </div>
          <div className="prof-handle">@{user.handle} · {user.category}</div>
          <div className="prof-bio">
            {user.bio}
            {user.link ? <> <span className="hl">{user.link}</span></> : null}
            {/* the About text lives in the description block — there is no separate section */}
            {about ? <p className="bio-desc">{about}</p> : null}

            {/* the young Rizal: family and what he loved, as labelled lines inside the
                same description block. His childhood events live in the Childhood
                highlight — five pictures with the events as their captions. */}
            {user.family || user.interests ? (
              <div className="bio-notes">
                {user.family ? (
                  <p className="bio-note"><span className="lbl">Family</span>{user.family}</p>
                ) : null}

                {user.interests ? (
                  <p className="bio-note"><span className="lbl">Childhood interests</span>{user.interests}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="stats">
            <div className="stat"><div className="n">{num(stats.posts)}</div><div className="l">Posts</div></div>
            <div className="stat"><div className="n">{compact(stats.followers)}</div><div className="l">Followers</div></div>
            <div className="stat"><div className="n">{num(stats.following)}</div><div className="l">Following</div></div>
          </div>

          <div className="prof-acts">
            {isMe ? (
              <>
                <button className="btn primary" onClick={() => uiSet({ editOpen: true })}>Edit profile</button>
                <button className="btn secondary" onClick={() => share('Nova — my profile')}>Share profile</button>
                <button className="btn sq" onClick={() => uiSet({ menuOpen: true })} aria-label="More"><More size={19} /></button>
              </>
            ) : (
              <>
                <button className={`btn primary ${following ? 'on' : ''}`} onClick={() => toggleFollow(user.id)}>
                  {following ? <><Check size={15} style={{ marginRight: 6 }} />Following</> : 'Follow'}
                </button>
                <button className="btn secondary" onClick={() => setMsgOpen(true)}>Message</button>
                <button className="btn sq" onClick={() => setMsgOpen(true)} aria-label="Message"><Chat size={19} /></button>
              </>
            )}
          </div>

          {/* ---------------- highlights ---------------- */}
          {/* label-only header, same as the Moments rail on Home — the rail's own
              "New" tile is the create affordance, so no duplicate button up here */}
          <div className="sec-head" style={{ padding: '18px 0 10px' }}>
            <span className="t">Highlights</span>
          </div>
        </div>

        <div className="hlights" ref={hlRef}>
          {isMe ? (
            <button className="hl-item" onClick={() => setHlOpen(true)}>
              <span className="hl-ring new"><Plus size={22} /></span>
              <span className="hl-label">New</span>
            </button>
          ) : null}

          {highlights.map((h) => (
            <button className="hl-item" key={h.id} onClick={() => viewHighlight(user.id, h.id, 0)}>
              <span className="hl-ring">
                <span className="in" style={{ backgroundImage: `url(${h.cover})` }} />
              </span>
              <span className="hl-label">{h.title}</span>
            </button>
          ))}
        </div>

        <div className="prof">
          <div className="ptabs">
            <button className={`ptab ${tab === 'posts' ? 'on' : ''}`} onClick={() => setTab('posts')} aria-label="Posts"><Grid size={21} /></button>
            <button className={`ptab ${tab === 'reels' ? 'on' : ''}`} onClick={() => setTab('reels')} aria-label="Reels"><Play size={21} /></button>
            <button className={`ptab ${tab === 'tagged' ? 'on' : ''}`} onClick={() => setTab('tagged')} aria-label="Tagged"><Tag size={21} /></button>
            <button className={`ptab ${tab === 'saved' ? 'on' : ''}`} onClick={() => setTab('saved')} aria-label="Saved"><BookmarkF size={19} /></button>
          </div>
        </div>

        {grid.length === 0 ? (
          <div className="empty" style={{ paddingTop: 46 }}>
            <div className="big">{emptyMsg[0]}</div>
            <div className="sm">{emptyMsg[1]}</div>
          </div>
        ) : (
          <div className="pgrid">
            {grid.map((p, i) => (
              <PostTile
                key={p.id}
                post={p}
                showMeta={i % 3 === 1}
                className={i % 7 === 0 ? 'tall' : i % 7 === 4 ? 'wide' : ''}
              />
            ))}
          </div>
        )}
      </div>

      {/* glass header slides in once the cover scrolls away */}
      <div className={`profbar ${scrolled ? 'show' : ''}`}>
        <button className="iconbtn ghost" onClick={back} aria-label="Back"><Back size={20} /></button>
        <span className="who">
          <span className="n">{user.name}{user.verified ? <Verified size={13} /> : null}</span>
          <span className="h">{user.category} · {num(stats.posts)} posts</span>
        </span>
        <button className="iconbtn" onClick={toggleTheme} aria-label="Toggle appearance">
          {data.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="iconbtn"
          onClick={() => (isMe ? uiSet({ menuOpen: true }) : toast('Reported for review'))}
          aria-label="More"
        >
          <More size={18} />
        </button>
      </div>

      {/* floating controls over the cover — hide once scrolled */}
      <div className={`cover-bar ${scrolled ? 'hide' : ''}`}>
        <button className="cvbtn" onClick={() => (isMe ? back() : back())} aria-label="Back"><Back size={20} /></button>
        <span style={{ display: 'flex', gap: 8 }}>
          <button className="cvbtn" onClick={toggleTheme} aria-label="Toggle appearance">
            {data.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="cvbtn" onClick={() => share(isMe ? 'Nova — my profile' : `@${user.handle} on Nova`)} aria-label="Share">
            <Send size={19} />
          </button>
          <button
            className="cvbtn"
            onClick={() => (isMe ? uiSet({ menuOpen: true }) : toast('Reported for review'))}
            aria-label="More"
          >
            <More size={19} />
          </button>
        </span>
      </div>

      {/* ---------------- new highlight ---------------- */}
      <Sheet
        open={hlOpen}
        onClose={() => setHlOpen(false)}
        title="New highlight"
        headRight={
          <button
            className="btn"
            style={{ height: 32, padding: '0 14px', color: 'var(--accent-text)', fontWeight: 700 }}
            onClick={createHighlight}
          >
            Create
          </button>
        }
      >
        <div className="field" style={{ marginTop: 4 }}>
          <div className="fieldbox">
            <input
              placeholder="Highlight name — e.g. Family, Travel, Work"
              value={hlTitle}
              onChange={(e) => setHlTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="sec-head" style={{ padding: '16px 16px 8px' }}>
          <span className="t">Choose photos</span>
          <span className="m">{hlPicks.length} selected</span>
        </div>

        <div className="picker">
          <button className="pcell addcell" onClick={() => hlUpRef.current.click()}>
            <Plus size={20} />
            <span className="cap">Upload</span>
            <input ref={hlUpRef} type="file" accept="image/*" hidden onChange={onHlUpload} />
          </button>
          {hlPicks.filter((src) => src.startsWith('data:')).map((src) => (
            <button key={src.slice(0, 64)} className="pcell on" onClick={() => togglePick(src)}>
              <img src={src} alt="uploaded" />
              <span className="tick"><Check size={11} /></span>
            </button>
          ))}
          {PHOTO_POOL.map((p) => (
            <button
              key={p.id}
              className={`pcell ${hlPicks.includes(p.src) ? 'on' : ''}`}
              onClick={() => togglePick(p.src)}
            >
              <img src={p.src} alt={p.label} />
              {hlPicks.includes(p.src) ? <span className="tick"><Check size={11} /></span> : null}
            </button>
          ))}
        </div>
        <div style={{ height: 22 }} />
      </Sheet>

      {/* ---------------- direct message ---------------- */}
      <Sheet open={msgOpen} onClose={() => setMsgOpen(false)} title={`@${user.handle}`}>
        <div style={{ padding: '16px 16px 0', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="av" style={{ width: 44, height: 44, backgroundImage: `url(${user.avatar})`, display: 'block' }} />
          <div style={{ textAlign: 'left', fontSize: 13, color: 'var(--txt-2)', lineHeight: 1.45 }}>
            Send a direct message to <b style={{ color: 'var(--txt)' }}>{user.name}</b>.<br />
            Messages are part of the demo only.
          </div>
        </div>
        <div style={{ padding: '16px 16px 0' }}>
          <div className="fieldbox" style={{ padding: 12 }}>
            <textarea
              placeholder="Write a message…"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              style={{ width: '100%', minHeight: 78, fontSize: 14, lineHeight: 1.45, resize: 'none', color: 'var(--txt)' }}
            />
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <button
            className="btn primary"
            style={{ width: '100%', opacity: msg.trim() ? 1 : .5 }}
            onClick={() => {
              if (!msg.trim()) return;
              setMsgOpen(false); setMsg('');
              toast(`Message sent to @${user.handle}`, 'ok');
            }}
          >
            Send message
          </button>
        </div>
      </Sheet>
    </>
  );
}
