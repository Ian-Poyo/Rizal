import React, { useRef, useState } from 'react';
import { useStore, num, timeAgo, buzz } from '../store';
import {
  Heart, HeartF, Comment, Send, Bookmark, BookmarkF, More, Verified, Play, Tag, Check, Plus
} from '../Icons';

/* render caption with highlighted #tags */
export function Caption({ text }) {
  if (!text) return null;
  const parts = String(text).split(/(#[\w-]+)/g);
  return (
    <div className="cap">
      {parts.map((p, i) =>
        p.startsWith('#') ? <span className="tg" key={i}>{p}</span> : <span key={i}>{p}</span>
      )}
    </div>
  );
}

/* ---------- multi-image media with swipe + double-tap-to-like ---------- */
function Media({ post, onDoubleLike }) {
  const [idx, setIdx] = useState(0);
  const strip = useRef(null);
  const tap = useRef({ x: 0, y: 0, t: 0, timer: null });
  const [burst, setBurst] = useState(0);

  const onScroll = () => {
    const el = strip.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  };

  const down = (e) => {
    tap.current.x = e.clientX;
    tap.current.y = e.clientY;
  };

  const up = (e) => {
    const dx = Math.abs(e.clientX - tap.current.x);
    const dy = Math.abs(e.clientY - tap.current.y);
    if (dx > 12 || dy > 12) return;            // it was a swipe
    const now = Date.now();
    if (now - tap.current.t < 300) {           // double tap → like
      buzz(12);
      onDoubleLike();
      setBurst((b) => b + 1);
      tap.current.t = 0;
    } else {
      tap.current.t = now;
    }
  };

  return (
    <div
      className="media-wrap"
      /* the frame matches the picture's own ratio, so nothing is cropped or stretched */
      style={{ aspectRatio: post.ratio || (post.kind === 'reel' ? 9 / 16 : 4 / 5), maxHeight: '78vh' }}
      onPointerDown={down}
      onPointerUp={up}
    >
      <div className="strip" ref={strip} onScroll={onScroll}>
        {post.media.map((src, i) => <img key={i} src={src} alt="" draggable="false" />)}
      </div>

      {post.location ? (
        <span className="media-tag"><Tag size={12} style={{ color: '#cfe0ff' }} />{post.location}</span>
      ) : null}

      {post.kind === 'reel' ? (
        <span className="kind-badge"><Play size={12} sw={2} />REEL</span>
      ) : null}

      {post.media.length > 1 ? (
        <div className="dots">
          {post.media.map((_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}
        </div>
      ) : null}

      {burst > 0 ? (
        <div className="heart-pop" key={burst}>
          <HeartF size={104} style={{ color: '#fff' }} />
        </div>
      ) : null}
    </div>
  );
}

export default function PostCard({ post, hideFollow, onOpenUser }) {
  const {
    byId, data, me, toggleLike, toggleSave, toggleFollow, openPost, openProfile, share
  } = useStore();

  const user = byId[post.userId];
  const following = !!data.following[post.userId];
  const isMe = post.userId === me.id;
  const collab = post.collab ? byId[post.collab] : null;

  return (
    <article className="post">
      <div className="post-head">
        <button
          className={`grad-ring ${following || isMe ? '' : 'seen'}`}
          style={{ width: 44, height: 44 }}
          onClick={() => (onOpenUser ? onOpenUser(user.id) : openProfile(user.id))}
          aria-label={user.name}
        >
          <span className="av" style={{ width: '100%', height: '100%', backgroundImage: `url(${user.avatar})`, display: 'block' }} />
        </button>

        <button className="post-who" onClick={() => (onOpenUser ? onOpenUser(user.id) : openProfile(user.id))}>
          <span className="post-name">
            {user.name}
            {user.verified ? <Verified size={14} /> : null}
          </span>
          <span className="post-sub">
            @{user.handle} · {timeAgo(post.createdAt)}
            {collab ? <> · with @{collab.handle}</> : null}
          </span>
        </button>

        {!hideFollow && !isMe ? (
          <button
            className={`followbtn ${following ? 'on' : ''}`}
            onClick={() => toggleFollow(user.id)}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        ) : (
          <button className="iconbtn ghost" onClick={() => openPost(post.id)} aria-label="Post options">
            <More size={20} />
          </button>
        )}
      </div>

      <Media post={post} onDoubleLike={() => { if (!post.likedByMe) toggleLike(post.id); }} />

      <div className="post-acts">
        <button className={`act ${post.likedByMe ? 'liked' : ''}`} onClick={() => toggleLike(post.id)} aria-label="Like">
          {post.likedByMe ? <HeartF size={25} /> : <Heart size={25} />}
          {post.likes > 0 ? <span className="n">{num(post.likes)}</span> : null}
        </button>

        <button className="act" onClick={() => openPost(post.id, true)} aria-label="Comments">
          <Comment size={25} />
          {post.comments.length > 0 ? <span className="n">{num(post.comments.length)}</span> : null}
        </button>

        <button className="act" onClick={() => share(`@${user.handle} on Nova`)} aria-label="Share">
          <Send size={24} />
        </button>

        <span className="grow" />

        <button className={`act ${post.saved ? 'saved' : ''}`} onClick={() => toggleSave(post.id)} aria-label="Save">
          {post.saved ? <BookmarkF size={23} /> : <Bookmark size={23} />}
        </button>
      </div>

      <div className="post-meta">
        {post.likes > 0 ? (
          <button className="likes" onClick={() => openPost(post.id)} style={{ display: 'block' }}>
            {num(post.likes)} {post.likes === 1 ? 'like' : 'likes'}
          </button>
        ) : null}

        <button onClick={() => openPost(post.id)} style={{ display: 'block', width: '100%' }}>
          <span className="cap">
            <b>{user.handle}</b>
            <CaptionInline text={post.caption} />
          </span>
        </button>

        {post.tags && post.tags.length ? (
          <span className="ptags">
            {post.tags.map((t) => <span className="tg" key={t}>#{t}</span>)}
          </span>
        ) : null}

        {post.comments.length > 0 ? (
          <button className="cmts link" onClick={() => openPost(post.id, true)}>
            View all {post.comments.length} comments
          </button>
        ) : (
          <button className="cmts link" onClick={() => openPost(post.id, true)}>
            Add a comment
          </button>
        )}
      </div>
    </article>
  );
}

/* caption inline (username already rendered by parent) */
function CaptionInline({ text }) {
  if (!text) return null;
  const parts = String(text).split(/(#[\w-]+)/g);
  return <>{parts.map((p, i) => (p.startsWith('#') ? <span className="tg" key={i}>{p}</span> : <span key={i}>{p}</span>))}</>;
}

/* small square tile used by grids — renders as the grid item itself */
export function PostTile({ post, showMeta, className = '' }) {
  const { openPost } = useStore();
  return (
    <button className={`tile ${className}`} onClick={() => openPost(post.id)}>
      <img src={post.media[0]} alt="" loading="lazy" />
      {post.kind === 'reel' ? (
        <span className="tbadge"><Play size={14} sw={2} /></span>
      ) : null}
      {showMeta && post.likes > 0 ? (
        <span className="tmeta"><HeartF size={12} />{num(post.likes)}</span>
      ) : null}
    </button>
  );
}
