import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  SEED_USERS, SEED_POSTS, SEED_FOLLOWING, SEED_SEEN, SEED_NOTIFS, STORIES,
  SEED_HIGHLIGHTS, ME
} from './data';

const KEY = 'nova.app.v5';   // v5: the young-Rizal profile

/* ---------------------------------------------------------------- helpers */
export const timeAgo = (ts) => {
  const s = Math.max(1, (Date.now() - ts) / 1000);
  if (s < 60) return Math.floor(s) + 's';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  if (s < 604800) return Math.floor(s / 86400) + 'd';
  return Math.floor(s / 604800) + 'w';
};
export const num = (n) => (n >= 1000 ? n.toLocaleString('en-US') : String(n));
export const compact = (n) => {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  if (n < 1000000) return Math.round(n / 1000) + 'K';
  return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
};
export const buzz = (ms = 8) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

const fresh = () => ({
  users: SEED_USERS.map((u) => ({ ...u })),
  posts: SEED_POSTS.map((p) => ({ ...p, comments: p.comments.map((x) => ({ ...x })) })),
  following: { ...SEED_FOLLOWING },
  notifs: SEED_NOTIFS.map((n) => ({ ...n })),
  seenStories: { ...SEED_SEEN },
  stories: STORIES.map((s) => ({ ...s })),
  highlights: Object.fromEntries(
    Object.entries(SEED_HIGHLIGHTS).map(([k, v]) => [k, v.map((h) => ({ ...h }))])
  ),
  theme: (typeof window !== 'undefined' && localStorage.getItem('nova.theme')) || 'dark',
  seeded: Date.now(),
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.posts || !parsed.users) return null;
    // if the cast changed under us, start clean rather than mixing eras
    const ids = SEED_USERS.map((u) => u.id).join(',');
    if (parsed.users.map((u) => u.id).sort().join(',') !== ids.split(',').sort().join(',')) return null;
    if (!parsed.stories) parsed.stories = STORIES.map((s) => ({ ...s }));
    if (!parsed.highlights) {
      parsed.highlights = Object.fromEntries(
        Object.entries(SEED_HIGHLIGHTS).map(([k, v]) => [k, v.map((h) => ({ ...h }))])
      );
    }
    if (!parsed.theme) parsed.theme = 'dark';

    // the seeded highlights are curated copy, not user content: if one changed
    // (round 20: Madrid rewritten, Painters → Family) refresh it in place, and
    // leave everything the user made — extra highlights, posts, uploads — alone.
    Object.entries(SEED_HIGHLIGHTS).forEach(([uid, list]) => {
      if (!parsed.highlights[uid]) return;
      const seedById = Object.fromEntries(list.map((h) => [h.id, h]));
      parsed.highlights[uid] = parsed.highlights[uid].map((h) => (
        seedById[h.id] && JSON.stringify(seedById[h.id]) !== JSON.stringify(h)
          ? { ...seedById[h.id] }
          : h
      ));
    });

    // earlier builds stored About as { family, siblings, work, ... } — fold it into prose
    const seedAbout = Object.fromEntries(SEED_USERS.map((u) => [u.id, u.about]));
    parsed.users = parsed.users.map((u) => {
      const a = u.about;
      if (typeof a === 'string') return u;
      if (a && typeof a === 'object') {
        const parts = [a.family, a.siblings, a.work, a.education, a.livesIn, a.interests].filter(Boolean);
        return { ...u, about: parts.length ? parts.join(' ') : (seedAbout[u.id] || '') };
      }
      return { ...u, about: seedAbout[u.id] || '' };
    });

    return parsed;
  } catch (e) { return null; }
}
function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch (e) { /* quota — keep running in memory */ }
}

/* ---------------------------------------------------------------- context */
const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [data, setData] = useState(() => load() || fresh());
  const [ui, setUi] = useState({
    tab: 'home',
    feedTab: 'forYou',
    query: '',
    profileId: null,      // viewing another account
    postId: null,         // post sheet
    viewer: null,         // { kind:'story'|'highlight', owner, id, index }

    island: null,
    toast: null,
    composerOpen: false,
    overlay: null,        // 'search' | 'activity'
    editOpen: false,
    menuOpen: false,
    loading: false,
  });

  useEffect(() => { save(data); }, [data]);

  const patch = useCallback((fn) => setData((prev) => {
    const next = fn(prev);
    return next || prev;
  }), []);

  const uiSet = useCallback((o) => setUi((prev) => ({ ...prev, ...o })), []);

  const toastRef = useRef(0);
  const toast = useCallback((msg, kind = 'info') => {
    const id = ++toastRef.current;
    setUi((u) => ({ ...u, toast: { id, msg, kind } }));
    setTimeout(() => setUi((u) => (u.toast && u.toast.id === id ? { ...u, toast: null } : u)), 2100);
  }, []);

  const island = useCallback((text, ms = 1800) => {
    setUi((u) => ({ ...u, island: text }));
    setTimeout(() => setUi((u) => (u.island === text ? { ...u, island: null } : u)), ms);
  }, []);

  /* ------------------------------------------------------------ actions */
  const go = (tab) => {
    buzz(6);
    uiSet({ tab, overlay: null, profileId: tab === 'profile' ? null : ui.profileId });
  };

  const toggleLike = useCallback((postId) => {
    buzz(10);
    let liked = false;
    patch((d) => ({
      ...d,
      posts: d.posts.map((p) => {
        if (p.id !== postId) return p;
        liked = !p.likedByMe;
        return { ...p, likedByMe: liked, likes: p.likes + (liked ? 1 : -1) };
      }),
    }));
    if (liked) island('Liked');
  }, [patch, island]);

  const toggleSave = useCallback((postId) => {
    buzz(10);
    let savedNow = false;
    patch((d) => ({
      ...d,
      posts: d.posts.map((p) => {
        if (p.id !== postId) return p;
        savedNow = !p.saved;
        return { ...p, saved: savedNow };
      }),
    }));
    toast(savedNow ? 'Saved to your collection' : 'Removed from saved', savedNow ? 'ok' : 'info');
  }, [patch, toast]);

  const addComment = useCallback((postId, text) => {
    const t = text.trim();
    if (!t) return;
    buzz(8);
    patch((d) => ({
      ...d,
      posts: d.posts.map((p) => p.id === postId
        ? { ...p, comments: [...p.comments, { id: 'c' + Date.now(), userId: ME, text: t, createdAt: Date.now() }] }
        : p),
    }));
    toast('Comment posted', 'ok');
  }, [patch, toast]);

  const toggleFollow = useCallback((userId) => {
    if (userId === ME) return;
    buzz(10);
    let nowFollowing = false;
    patch((d) => {
      nowFollowing = !d.following[userId];
      const following = { ...d.following };
      if (nowFollowing) following[userId] = true; else delete following[userId];
      return {
        ...d,
        following,
        users: d.users.map((u) => u.id === userId
          ? { ...u, followers: u.followers + (nowFollowing ? 1 : -1) }
          : u),
      };
    });
    toast(nowFollowing ? 'Following' : 'Unfollowed', nowFollowing ? 'ok' : 'info');
  }, [patch, toast]);

  const addPost = useCallback(({ media, caption, tags, kind, location }) => {
    const id = 'p' + Date.now();
    const post = {
      id, userId: ME, kind: kind || 'post', media: [media],
      caption: caption || '', tags: tags || [], location: location || '',
      likes: 0, likedByMe: false, saved: false, tagged: [],
      comments: [], createdAt: Date.now(),
    };
    buzz(14);
    patch((d) => ({
      ...d,
      posts: [post, ...d.posts],
      notifs: [{
        id: 'n' + Date.now(), type: 'system', userId: ME, postId: id,
        text: 'Your post is live', createdAt: Date.now(), unread: true,
      }, ...d.notifs],
    }));
    toast('Shared to your profile', 'ok');
    uiSet({ tab: 'profile', profileId: null, composerOpen: false, feedTab: 'forYou' });
    return id;
  }, [patch, toast]);

  const deletePost = useCallback((postId) => {
    patch((d) => ({ ...d, posts: d.posts.filter((p) => p.id !== postId) }));
    uiSet({ postId: null });
    toast('Post deleted');
  }, [patch, toast]);

  const viewStory = useCallback((userId, index = 0) => {
    setUi((u) => ({ ...u, viewer: { kind: 'story', owner: userId, id: userId, index } }));
    patch((d) => ({ ...d, seenStories: { ...d.seenStories, [userId]: Date.now() } }));
  }, [patch]);

  const openHighlight = useCallback((owner, highlightId, index = 0) => {
    buzz(6);
    setUi((u) => ({ ...u, viewer: { kind: 'highlight', owner, id: highlightId, index } }));
  }, []);

  const closeViewer = useCallback(() => setUi((u) => ({ ...u, viewer: null })), []);

  const markSeen = useCallback((userId) => {
    if (!userId) return;
    patch((d) => (d.seenStories[userId]
      ? d
      : { ...d, seenStories: { ...d.seenStories, [userId]: Date.now() } }));
  }, [patch]);

  const toggleTheme = useCallback(() => {
    buzz(8);
    let next = 'dark';
    setData((d) => { next = d.theme === 'dark' ? 'light' : 'dark'; return { ...d, theme: next }; });
    try { localStorage.setItem('nova.theme', next === 'dark' ? 'light' : 'dark'); } catch (e) {}
  }, []);

  /* your own story — uploaded from the device, replaces any earlier one */
  const addStory = useCallback((media) => {
    patch((d) => ({
      ...d,
      stories: [
        { userId: ME, media, createdAt: Date.now() },
        ...d.stories.filter((st) => st.userId !== ME),
      ],
    }));
    toast('Added to your story', 'ok');
  }, [patch, toast]);

  const addHighlight = useCallback((title, items) => {
    if (!title.trim() || !items.length) return;
    buzz(12);
    const hl = { id: 'h' + Date.now(), title: title.trim(), cover: items[0], items };
    patch((d) => ({
      ...d,
      highlights: { ...d.highlights, [ME]: [hl, ...(d.highlights[ME] || [])] },
    }));
    toast('Highlight created', 'ok');
  }, [patch, toast]);

  const deleteHighlight = useCallback((id) => {
    patch((d) => ({
      ...d,
      highlights: { ...d.highlights, [ME]: (d.highlights[ME] || []).filter((h) => h.id !== id) },
    }));
    uiSet({ viewer: null });
    toast('Highlight removed');
  }, [patch, toast, uiSet]);

  const openPost = (postId) => { buzz(6); uiSet({ postId, overlay: null }); };
  const openProfile = (userId, from) => {
    buzz(6);
    uiSet({ profileId: userId, overlay: null, fromTab: from || ui.tab });
  };
  const back = () => uiSet({ profileId: null, tab: ui.fromTab || 'home' });

  const readNotifs = useCallback(() => {
    patch((d) => ({ ...d, notifs: d.notifs.map((n) => (n.unread ? { ...n, unread: false } : n)) }));
  }, [patch]);

  const refresh = useCallback(() => {
    uiSet({ loading: true });
    return new Promise((res) => setTimeout(() => { uiSet({ loading: false }); res(); }, 900));
  }, []);

  const resetDemo = useCallback(() => {
    setData(fresh());
    // keep the user where they are — just clear the transient overlays
    uiSet({
      profileId: null, postId: null, composerOpen: false, editOpen: false,
      menuOpen: false, query: '', feedTab: 'forYou', viewer: null, island: null, overlay: null,
    });
    toast('Demo data restored', 'ok');
  }, [toast]);

  const updateProfile = useCallback((patchObj) => {
    patch((d) => ({ ...d, users: d.users.map((u) => (u.id === ME ? { ...u, ...patchObj } : u)) }));
    toast('Profile updated', 'ok');
  }, [patch, toast]);

  const share = useCallback((title) => {
    buzz(8);
    const url = location.href.split('#')[0];
    if (navigator.share) {
      navigator.share({ title, text: title, url }).catch(() => {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => toast('Link copied to clipboard', 'ok'),
        () => toast('Link copied', 'ok')
      );
    } else toast('Link copied', 'ok');
  }, [toast]);

  /* ------------------------------------------------------------ derived */
  const derived = useMemo(() => {
    const users = data.users;
    const byId = Object.fromEntries(users.map((u) => [u.id, u]));
    const me = byId[ME];
    const myFollowingCount = me.following + Object.values(data.following).filter(Boolean).length;

    const feed = (which) => {
      const list = data.posts.filter((p) => (which === 'following' ? !!data.following[p.userId] || p.userId === ME : true));
      return [...list].sort((a, b) => b.createdAt - a.createdAt);
    };
    const postsOf = (userId) => data.posts.filter((p) => p.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
    const savedPosts = data.posts.filter((p) => p.saved);
    const taggedPosts = data.posts.filter((p) => (p.tagged || []).includes(ME));
    const reelsOf = (userId) => postsOf(userId).filter((p) => p.kind === 'reel');
    const unread = data.notifs.filter((n) => n.unread).length;
    /* the stat counts what the account has actually posted — nothing padded */
    const postCount = (u) => data.posts.filter((p) => p.userId === u.id).length;

    // a creator without curated highlights falls back to their own posts
    const highlightsOf = (userId) => {
      const own = data.highlights[userId];
      if (own && own.length) return own;
      return postsOf(userId).slice(0, 4).map((p) => ({
        id: 'gen-' + p.id, title: (p.tags && p.tags[0]) || 'Posts',
        cover: p.media[0], items: p.media,
      }));
    };

    const search = (q) => {
      const s = q.trim().toLowerCase();
      if (!s) return { users: [], posts: [] };
      return {
        users: users.filter((u) => (u.name + ' ' + u.handle + ' ' + u.category).toLowerCase().includes(s)),
        posts: data.posts.filter((p) =>
          (p.caption + ' ' + (p.tags || []).join(' ') + ' ' + (p.location || '')).toLowerCase().includes(s)),
      };
    };

    return {
      byId, me, myFollowingCount, feed, postsOf, savedPosts, taggedPosts,
      reelsOf, unread, postCount, search, highlightsOf,
    };
  }, [data]);

  const value = {
    data, ui, ...derived,
    uiSet, go, toggleLike, toggleSave, addComment, toggleFollow, addPost, deletePost,
    openPost, openProfile, back, viewStory, viewHighlight: openHighlight, closeViewer,
    toggleTheme, addStory, addHighlight, deleteHighlight, markSeen,
    readNotifs, refresh, resetDemo, updateProfile, share, toast, island,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
