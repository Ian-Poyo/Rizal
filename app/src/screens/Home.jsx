import React, { useRef, useState } from 'react';
import { useStore, num } from '../store';
import PostCard from '../components/Post';
import { Plus } from '../Icons';
import useDragScroll from '../useDragScroll';
import shrink from '../files';

export default function Home() {
  const { ui, uiSet, data, byId, me, feed, go, refresh, viewStory, addStory, toast } = useStore();

  const posts = feed(ui.feedTab);
  const followingCount = data.posts.filter((p) => data.following[p.userId] || p.userId === me.id).length;

  const scroller = useRef(null);
  const railRef = useDragScroll();
  const storyRef = useRef(null);
  const myStory = data.stories.find((st) => st.userId === me.id);

  // tap your story to watch it, or the + badge to upload a new one
  const onStoryPick = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    shrink(file, { max: 1200, quality: 0.75 }).then((media) => {
      if (media) addStory(media);
      else toast('Could not read that image');
    });
  };
  const startY = useRef(null);
  const [pull, setPull] = useState(0);

  const onDown = (e) => {
    if (scroller.current && scroller.current.scrollTop <= 0) startY.current = e.clientY;
  };
  const onMove = (e) => {
    if (startY.current == null) return;
    const d = e.clientY - startY.current;
    if (d > 6) setPull(Math.min(78, d * 0.5));
  };
  const onUp = async () => {
    startY.current = null;
    if (pull > 44) { await refresh(); }
    setPull(0);
  };

  return (
    <>
      {/* Home has no app bar — the feed starts at the top of the safe area */}
      <div
        className="scroller full"
        ref={scroller}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="pullind" style={{ height: pull }}>
          {pull > 6 ? <span className="spinner" style={{ transform: `rotate(${pull * 4}deg)` }} /> : null}
        </div>

        <div className="rail-head" style={{ paddingTop: 16 }}>
          <span className="t">Moments</span>
        </div>

        {/* drag right-to-left with a mouse; native swipe on touch */}
        <div className="rail" ref={railRef}>
          <button
            className="story"
            onClick={() => (myStory ? viewStory(me.id, 0) : storyRef.current.click())}
          >
            <span className="story-wrap">
              <span className={`grad-ring ${myStory ? '' : 'seen'}`}>
                <span className="av" style={{ width: 56, height: 56, backgroundImage: `url(${myStory ? myStory.media : me.avatar})`, display: 'block' }} />
              </span>
              <span className="plus" onClick={(e) => { e.stopPropagation(); storyRef.current.click(); }}><Plus size={12} /></span>
            </span>
            <span className="lb">Your story</span>
            <input ref={storyRef} type="file" accept="image/*" hidden onChange={onStoryPick} />
          </button>

          {data.stories.map((s) => {
            const u = byId[s.userId];
            const seen = !!data.seenStories[s.userId];
            return (
              <button className="story" key={s.userId} onClick={() => viewStory(s.userId, 0)}>
                <span className={`grad-ring ${seen ? 'seen' : ''}`}>
                  <span className="av" style={{ width: 56, height: 56, backgroundImage: `url(${u.avatar})`, display: 'block' }} />
                </span>
                <span className="lb">{u.handle.split('.')[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="feedtabs">
          <button className={`feedtab ${ui.feedTab === 'forYou' ? 'on' : ''}`} onClick={() => uiSet({ feedTab: 'forYou' })}>
            For You
          </button>
          <button className={`feedtab ${ui.feedTab === 'following' ? 'on' : ''}`} onClick={() => uiSet({ feedTab: 'following' })}>
            Following<span className="cnt">{followingCount}</span>
          </button>
        </div>

        {ui.loading ? (
          <div className="skel">
            <div className="ln" style={{ width: '42%' }} />
            <div className="blk" />
            <div className="ln" style={{ width: '68%' }} />
            <div className="ln" style={{ width: '30%' }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty">
            <div className="big">Your Following feed is quiet</div>
            <div className="sm">Follow a few creators and their posts will show up here.</div>
          </div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} />)
        )}

        <div style={{ padding: '22px 0 6px', textAlign: 'center', fontSize: 12, color: '#3d434f', fontWeight: 500 }}>
          You're all caught up
        </div>
      </div>
    </>
  );
}
