import React, { useEffect } from 'react';
import { useStore, timeAgo } from '../store';
import { HeartF, Comment, User, Tag, Check, Verified, Back } from '../Icons';

const icoFor = (t) => {
  if (t === 'like') return { C: HeartF, bg: 'linear-gradient(160deg,#ff5f7a,#e02a52)' };
  if (t === 'comment') return { C: Comment, bg: 'linear-gradient(160deg,#3d86ff,#2456e6)' };
  if (t === 'follow') return { C: User, bg: 'linear-gradient(160deg,#7c5cff,#5b3ce0)' };
  if (t === 'mention') return { C: Tag, bg: 'linear-gradient(160deg,#22d3ee,#0f9bb5)' };
  return { C: Check, bg: 'linear-gradient(160deg,#2fd07a,#12a05a)' };
};

export default function Activity({ onBack }) {
  const { data, byId, readNotifs, openPost, openProfile, unread } = useStore();

  /* clear the badge shortly after the screen is opened */
  useEffect(() => {
    if (unread === 0) return;
    const t = setTimeout(readNotifs, 1100);
    return () => clearTimeout(t);
  }, [unread]);

  const items = [...data.notifs].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      <header className="appbar">
        {onBack ? (
          <button className="iconbtn ghost" onClick={onBack} aria-label="Back"><Back size={20} /></button>
        ) : null}
        <div style={{ flex: 1, textAlign: 'left', fontSize: 18, fontWeight: 700, letterSpacing: '-.45px' }}>Activity</div>
        {unread > 0 ? (
          <button className="btn" style={{ height: 32, padding: '0 12px', color: '#5b9bff', fontSize: 13, fontWeight: 650 }} onClick={readNotifs}>
            Mark all read
          </button>
        ) : null}
      </header>

      <div className={`scroller ${onBack ? 'narrow' : ''}`}>
        {items.length === 0 ? (
          <div className="empty" style={{ paddingTop: 80 }}>
            <div className="big">Nothing yet</div>
            <div className="sm">Likes, comments and new followers will land here.</div>
          </div>
        ) : (
          items.map((n) => {
            const u = byId[n.userId];
            const post = n.postId ? data.posts.find((p) => p.id === n.postId) : null;
            const { C, bg } = icoFor(n.type);
            const label =
              n.type === 'like' ? 'liked your post'
                : n.type === 'comment' ? 'commented:'
                  : n.type === 'follow' ? 'started following you'
                    : n.type === 'mention' ? 'tagged you in a post'
                      : (n.text || 'New activity');

            return (
              <button
                className={`act-row ${n.unread ? 'unread' : ''}`}
                key={n.id}
                onClick={() => {
                  if (n.userId !== 'amaravale' && n.userId) openProfile(n.userId, 'activity');
                }}
              >
                <span style={{ position: 'relative', flex: 'none' }}>
                  <span className="av" style={{ width: 46, height: 46, backgroundImage: `url(${u.avatar})`, display: 'block' }} />
                  <span className="act-ico" style={{ background: bg }}><C size={11} /></span>
                </span>

                <span className="act-txt">
                  <b>{u.handle}</b> {label}{n.text && n.type === 'comment' ? ` “${n.text}”` : ''}
                  <span className="when">{timeAgo(n.createdAt)} ago</span>
                </span>

                {post ? (
                  <img className="act-thumb" src={post.media[0]} alt="" onClick={(e) => { e.stopPropagation(); openPost(post.id); }} />
                ) : n.type === 'follow' ? (
                  <span className="btn secondary" style={{ width: 'auto', padding: '0 14px', height: 32, fontSize: 12.5 }}>
                    Follow
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
