import React, { useMemo, useState } from 'react';
import { useStore, compact, num } from '../store';
import { Search, Filter, Verified, Play, Close, Back } from '../Icons';
import { PostTile } from '../components/Post';
import { TRENDING } from '../data';

export default function Discover({ onBack }) {
  const { data, ui, uiSet, search, openProfile, toggleFollow, openPost } = useStore();
  const q = ui.query;
  const res = useMemo(() => search(q), [q, data]);
  const [filter, setFilter] = useState('all');

  const posts = useMemo(() => {
    let list = [...data.posts].sort((a, b) => b.likes - a.likes);
    if (filter === 'reels') list = list.filter((p) => p.kind === 'reel');
    if (filter === 'posts') list = list.filter((p) => p.kind !== 'reel');
    return list;
  }, [data.posts, filter]);

  return (
    <>
      <header className="appbar">
        {onBack ? (
          <button className="iconbtn ghost" onClick={onBack} aria-label="Back"><Back size={20} /></button>
        ) : null}
        <span className="searchbar">
          <Search size={18} style={{ color: '#6b7284' }} />
          <input
            placeholder="Search creators, tags, sounds"
            value={q}
            onChange={(e) => uiSet({ query: e.target.value })}
            autoComplete="off"
          />
          {q ? (
            <button onClick={() => uiSet({ query: '' })} aria-label="Clear"><Close size={15} style={{ color: '#6b7284' }} /></button>
          ) : null}
        </span>
        <button
          className="iconbtn"
          onClick={() => setFilter(filter === 'all' ? 'reels' : filter === 'reels' ? 'posts' : 'all')}
          aria-label="Filter"
          style={{ color: filter === 'all' ? '#fff' : '#3d86ff' }}
        >
          <Filter size={20} />
        </button>
      </header>

      <div className={`scroller ${onBack ? 'narrow' : 'no-pad'}`}>
        {q ? (
          <>
            {res.users.length ? (
              <>
                <div className="sec-head"><span className="t">Creators</span><span className="m">{res.users.length}</span></div>
                <div className="people">
                  {res.users.map((u) => {
                    const following = !!data.following[u.id];
                    return (
                      <div className="personrow" key={u.id}>
                        <button onClick={() => openProfile(u.id)}>
                          <span className="av" style={{ width: 48, height: 48, backgroundImage: `url(${u.avatar})`, display: 'block' }} />
                        </button>
                        <button className="rt" onClick={() => openProfile(u.id)}>
                          <div className="nm">{u.name}{u.verified ? <Verified size={13} /> : null}</div>
                          <div className="hd">@{u.handle} · {compact(u.followers)} followers</div>
                        </button>
                        <button
                          className={`followbtn ${following ? 'on' : ''}`}
                          onClick={() => toggleFollow(u.id)}
                        >
                          {following ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}

            <div className="sec-head">
              <span className="t">Posts</span>
              <span className="m">{res.posts.length} results</span>
            </div>
            {res.posts.length ? (
              <div className="explore">
                {res.posts.map((p) => <PostTile key={p.id} post={p} showMeta />)}
              </div>
            ) : (
              <div className="empty">
                <div className="big">No posts match “{q}”</div>
                <div className="sm">Try a different tag, creator or place.</div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="sec-head" style={{ paddingBottom: 4 }}>
              <span className="t">Trending now</span>
              <span className="m">Updated live</span>
            </div>
            <div className="chips">
              {TRENDING.map((t, i) => (
                <button key={t} className={`chipbtn ${i < 3 ? 'hot' : ''}`} onClick={() => uiSet({ query: t })}>
                  #{t}
                </button>
              ))}
            </div>

            <div className="sec-head" style={{ paddingTop: 6 }}>
              <span className="t">Explore</span>
              <span className="m">
                {filter === 'all' ? 'Everything' : filter === 'reels' ? 'Reels only' : 'Posts only'}
              </span>
            </div>
            <div className="explore">
              {posts.map((p, i) => (
                <div key={p.id} className={p.kind === 'reel' ? 'tile reel' : i % 7 === 4 ? 'tile wide' : 'tile'}>
                  <button style={{ width: '100%', height: '100%' }} onClick={() => openPost(p.id)}>
                    <img src={p.media[0]} alt="" loading="lazy" />
                    {p.kind === 'reel' ? <span className="tbadge"><Play size={14} sw={2} /></span> : null}
                    <span className="tmeta">{num(p.likes)}</span>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
