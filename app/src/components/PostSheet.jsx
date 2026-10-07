import React, { useEffect, useRef, useState } from 'react';
import { useStore, num, timeAgo, buzz } from '../store';
import { Heart, HeartF, Comment, Send, Bookmark, BookmarkF, Verified, Tag, Play, Close, Trash, More } from '../Icons';

export default function PostSheet() {
  const {
    ui, uiSet, byId, openProfile, toggleLike, toggleSave, toggleFollow, data,
    addComment, share, deletePost, me
  } = useStore();

  const post = ui.postId ? data.posts.find((p) => p.id === ui.postId) : null;
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const bodyRef = useRef(null);
  const cmtRef = useRef(null);
  const stripRef = useRef(null);

  useEffect(() => { setIdx(0); setText(''); if (stripRef.current) stripRef.current.scrollLeft = 0; }, [ui.postId]);
  useEffect(() => {
    if (ui.postId && ui.commentFocus && cmtRef.current && bodyRef.current) {
      bodyRef.current.scrollTop = cmtRef.current.offsetTop - 60;
    }
  }, [ui.postId, ui.commentFocus]);

  if (!post) return null;
  const user = byId[post.userId];
  const following = !!data.following[post.userId];
  const mine = post.userId === me.id;

  const close = () => uiSet({ postId: null, commentFocus: false });
  const submit = () => { if (text.trim()) { addComment(post.id, text); setText(''); } };

  return (
    <>
      <div className="veil" onClick={close} />
      <div className="sheet" style={{ maxHeight: '94%', height: '94%' }}>
        <div className="grabber" />
        <div className="sheet-head">
          <button
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            onClick={() => { close(); openProfile(user.id); }}
          >
            <span className="av" style={{ width: 34, height: 34, backgroundImage: `url(${user.avatar})`, display: 'block' }} />
            <span style={{ textAlign: 'left' }}>
              <span className="post-name" style={{ fontSize: 14 }}>
                {user.handle}{user.verified ? <Verified size={13} /> : null}
              </span>
              <span className="post-sub" style={{ display: 'block' }}>{post.location || user.category} · {timeAgo(post.createdAt)}</span>
            </span>
          </button>

          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!mine ? (
              <button
                className={`followbtn ${following ? 'on' : ''}`}
                onClick={() => toggleFollow(user.id)}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            ) : (
              <button className="followbtn on" onClick={() => { deletePost(post.id); }} style={{ color: '#ff6b7f' }}>
                <Trash size={14} />
              </button>
            )}
            <button className="iconbtn ghost" onClick={close} aria-label="Close"><Close size={18} /></button>
          </span>
        </div>

        <div className="sheet-body" ref={bodyRef}>
          <div className="media-wrap" style={{ margin: '12px 14px 0', aspectRatio: post.kind === 'reel' ? '9 / 16' : '4 / 5' }}>
            <div
              className="strip"
              ref={stripRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                setIdx(Math.round(el.scrollLeft / el.clientWidth));
              }}
            >
              {post.media.map((src, i) => <img key={i} src={src} alt="" />)}
            </div>
            {post.kind === 'reel' ? <span className="kind-badge"><Play size={12} sw={2} />REEL</span> : null}
            {post.media.length > 1 ? (
              <div className="dots">
                {post.media.map((_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}
              </div>
            ) : null}
          </div>

          <div className="post-acts">
            <button className={`act ${post.likedByMe ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
              {post.likedByMe ? <HeartF size={25} /> : <Heart size={25} />}
              {post.likes > 0 ? <span className="n">{num(post.likes)}</span> : null}
            </button>
            <button className="act" onClick={() => cmtRef.current && bodyRef.current && (bodyRef.current.scrollTop = cmtRef.current.offsetTop - 60)}>
              <Comment size={25} />
              {post.comments.length ? <span className="n">{num(post.comments.length)}</span> : null}
            </button>
            <button className="act" onClick={() => share(`@${user.handle} on Nova`)}><Send size={24} /></button>
            <span className="grow" />
            <button className={`act ${post.saved ? 'saved' : ''}`} onClick={() => toggleSave(post.id)}>
              {post.saved ? <BookmarkF size={23} /> : <Bookmark size={23} />}
            </button>
          </div>

          <div className="post-meta">
            {post.likes > 0 ? <div className="likes">{num(post.likes)} likes</div> : <div className="likes">Be the first to like this</div>}
            <div className="cap"><b>{user.handle}</b>{post.caption}</div>
            {post.tags && post.tags.length ? (
              <div className="cap">
                {post.tags.map((t) => <span className="tg" key={t} style={{ marginRight: 8 }}>#{t}</span>)}
              </div>
            ) : null}
            <div className="stamp" style={{ fontSize: 11, color: '#6b7284', marginTop: 6 }}>{timeAgo(post.createdAt)} ago</div>
          </div>

          <div ref={cmtRef} style={{ height: 1 }} />

          <div style={{ padding: '14px 17px 4px', fontSize: 13, fontWeight: 650, color: '#9ba2b2', borderTop: '1px solid rgba(255,255,255,.055)', marginTop: 14 }}>
            Comments {post.comments.length ? <span style={{ color: '#6b7284' }}>· {post.comments.length}</span> : null}
          </div>

          {post.comments.length === 0 ? (
            <div className="empty" style={{ padding: '28px 24px 34px' }}>
              <div className="big">No comments yet</div>
              <div className="sm">Start the conversation.</div>
            </div>
          ) : (
            post.comments
              .slice()
              .sort((a, b) => a.createdAt - b.createdAt)
              .map((c) => {
                const cu = byId[c.userId];
                return (
                  <div className="cmt" key={c.id}>
                    <button onClick={() => { close(); openProfile(cu.id); }}>
                      <span className="av" style={{ width: 34, height: 34, backgroundImage: `url(${cu.avatar})`, display: 'block' }} />
                    </button>
                    <div className="txt">
                      <b>{cu.handle}</b>{c.text}
                      <div className="when">
                        <span>{timeAgo(c.createdAt)}</span>
                        <button style={{ color: '#6b7284' }} onClick={() => addComment(post.id, `@${cu.handle} `)}>Reply</button>
                      </div>
                    </div>
                    <button className="act" onClick={() => addComment(post.id, `@${cu.handle} `)}><Heart size={16} /></button>
                  </div>
                );
              })
          )}
          <div style={{ height: 12 }} />
        </div>

        <div className="cmt-input">
          <span className="av" style={{ width: 32, height: 32, backgroundImage: `url(${me.avatar})`, display: 'block' }} />
          <span className="box">
            <input
              placeholder="Add a comment…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </span>
          <button className="sendbtn" disabled={!text.trim()} onClick={submit} aria-label="Send">
            <Send size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
