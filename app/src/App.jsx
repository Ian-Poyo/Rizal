import React, { useEffect, useState } from 'react';
import { StoreProvider, useStore } from './store';
import { StatusBar, Island, TabBar, Toast, ProfileMenu, EditProfile } from './components/Chrome';
import PostSheet from './components/PostSheet';
import StoryViewer from './components/StoryViewer';
import Home from './screens/Home';
import Discover from './screens/Discover';
import Create from './screens/Create';
import Activity from './screens/Activity';
import Profile from './screens/Profile';

function Shell() {
  const { ui, uiSet, me, data } = useStore();

  /* the theme lives on <html> so the stage around the phone follows too */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', data.theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', data.theme === 'dark' ? '#000000' : '#ffffff');
    const colorScheme = document.querySelector('meta[name="color-scheme"]');
    if (colorScheme) colorScheme.setAttribute('content', data.theme);
  }, [data.theme]);

  return (
    <div className="app">
      <StatusBar />
      <Island />

      {/* screens live here, so content scrolls *under* the glass chrome */}
      <div className="stagebody">
        {ui.profileId ? (
          <Profile userId={ui.profileId} />
        ) : (
          <>
            {ui.tab === 'home' && <Home />}
            {ui.tab === 'create' && <Create />}
            {ui.tab === 'profile' && <Profile userId={me.id} />}
          </>
        )}

        <TabBar />
        <Toast />

        {/* screens that are no longer tabs open as full-screen overlays */}
        {ui.overlay === 'search' ? (
          <div className="overlay"><Discover onBack={() => uiSet({ overlay: null })} /></div>
        ) : null}
        {ui.overlay === 'activity' ? (
          <div className="overlay"><Activity onBack={() => uiSet({ overlay: null })} /></div>
        ) : null}
      </div>

      <PostSheet />
      <StoryViewer />
      <ProfileMenu open={!!ui.menuOpen} onClose={() => uiSet({ menuOpen: false })} />
      <EditProfile open={!!ui.editOpen} onClose={() => uiSet({ editOpen: false })} />
    </div>
  );
}

export default function App() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const h = window.innerHeight;
      const w = window.innerWidth;
      setScale(Math.max(.62, Math.min(1.08, Math.min((h - 36) / 828, (w - 24) / 396))));
    };
    const mobile = () => {
      const m = window.innerWidth < 620 ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      document.body.classList.toggle('is-mobile', m);
    };
    const onResize = () => { fit(); mobile(); };
    fit(); mobile();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  return (
    <StoreProvider>
      <div className="viewport">
        {/* stage is plain white — no decoration behind the phone */}

        <div className="phone" style={{ '--scale': scale }}>
          <span className="hw action" />
          <span className="hw vup" />
          <span className="hw vdn" />
          <span className="hw power" />
          <div className="bezel">
            <div className="screen">
              <Shell />
              <div className="glare" />
            </div>
          </div>
        </div>
      </div>
    </StoreProvider>
  );
}
