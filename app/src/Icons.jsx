import React from 'react';

const S = ({ children, size = 24, sw = 1.9, fill = false, style }) => (
  <svg
    className="ic" width={size} height={size} viewBox="0 0 24 24"
    style={{ ...style, color: 'currentColor' }} aria-hidden="true"
    fill={fill ? 'currentColor' : 'none'}
    stroke={fill ? 'none' : 'currentColor'}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const Back = (p) => <S {...p}><path d="M14.8 18.6 8.4 12l6.4-6.6" /></S>;
export const Search = (p) => <S {...p}><circle cx="11" cy="11" r="6.6" /><path d="m16.1 16.1 4.3 4.3" /></S>;
export const Heart = (p) => <S {...p}><path d="M12 20.4S3.6 15.5 3.6 9.7A4.75 4.75 0 0 1 12 6.6a4.75 4.75 0 0 1 8.4 3.1c0 5.8-8.4 10.7-8.4 10.7Z" /></S>;
export const HeartF = (p) => <S {...p} fill><path d="M12 20.6S3.3 15.5 3.3 9.5A5 5 0 0 1 12 6.2a5 5 0 0 1 8.7 3.3c0 6-8.7 11.1-8.7 11.1Z" /></S>;
export const Comment = (p) => <S {...p}><path d="M20.7 11.7c0 4.3-3.9 7.8-8.7 7.8-1.02 0-2-.16-2.9-.45l-4.6 1.5 1.05-3.4A7.4 7.4 0 0 1 3.3 11.7C3.3 7.4 7.2 3.9 12 3.9s8.7 3.5 8.7 7.8Z" /></S>;
export const Send = (p) => <S {...p}><path d="M21.2 3.4 10.4 14.4M21.2 3.4l-6.7 17.4-3.4-6.9-7-3.2 17.1-7.3Z" /></S>;
export const Bookmark = (p) => <S {...p}><path d="M6.6 4.5h10.8v15.9L12 16.7l-5.4 3.7V4.5Z" /></S>;
export const BookmarkF = (p) => <S {...p} fill><path d="M6.5 4.3h11v16.3L12 16.7l-5.5 3.9V4.3Z" /></S>;
export const More = (p) => <S {...p} fill><circle cx="5.4" cy="12" r="1.65" /><circle cx="12" cy="12" r="1.65" /><circle cx="18.6" cy="12" r="1.65" /></S>;
export const Home = (p) => <S {...p}><path d="M3.9 10.5 12 4l8.1 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.3H9.6v5.3H5.4A1.5 1.5 0 0 1 3.9 19v-8.5Z" /></S>;
export const HomeF = (p) => <S {...p} fill><path d="M3.9 10.5 12 4l8.1 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.3H9.6v5.3H5.4A1.5 1.5 0 0 1 3.9 19v-8.5Z" /></S>;
export const Plus = (p) => <S {...p} sw={2.5}><path d="M12 5.6v12.8M5.6 12h12.8" /></S>;
export const Activity = (p) => <S {...p}><path d="M12 16.9s-4-2.3-4-5.1a2.1 2.1 0 0 1 4-1 2.1 2.1 0 0 1 4 1c0 2.8-4 5.1-4 5.1Z" /><rect x="3.5" y="3.5" width="17" height="17" rx="5.4" /></S>;
export const ActivityF = (p) => <S {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5.4" /><path d="M12 17.1s-4.2-2.4-4.2-5.3a2.2 2.2 0 0 1 4.2-1.05A2.2 2.2 0 0 1 16.2 11.8c0 2.9-4.2 5.3-4.2 5.3Z" fill="currentColor" stroke="none" /></S>;
export const User = (p) => <S {...p}><circle cx="12" cy="8.2" r="3.9" /><path d="M4.7 20.3c.85-3.6 3.75-5.7 7.3-5.7s6.45 2.1 7.3 5.7" /></S>;
export const UserF = (p) => <S {...p} fill><circle cx="12" cy="8.2" r="4" /><path d="M4.4 20.4c.9-3.7 3.85-5.85 7.6-5.85s6.7 2.15 7.6 5.85H4.4Z" /></S>;
export const Filter = (p) => <S {...p}><path d="M3.6 7.6h3.3M11.4 7.6h9M3.6 16.4h9.1M17.2 16.4h3.2" /><circle cx="9.1" cy="7.6" r="2.15" /><circle cx="14.9" cy="16.4" r="2.15" /></S>;
export const Grid = (p) => <S {...p} sw={1.8}><rect x="3.6" y="3.6" width="6.6" height="6.6" rx="1.7" /><rect x="13.8" y="3.6" width="6.6" height="6.6" rx="1.7" /><rect x="3.6" y="13.8" width="6.6" height="6.6" rx="1.7" /><rect x="13.8" y="13.8" width="6.6" height="6.6" rx="1.7" /></S>;
export const Play = (p) => <S {...p} sw={1.8}><rect x="3.4" y="3.4" width="17.2" height="17.2" rx="5.2" /><path d="m10.2 8.6 5.4 3.4-5.4 3.4V8.6Z" fill="currentColor" stroke="none" /></S>;
export const Tag = (p) => <S {...p} sw={1.8}><path d="M10.4 3.6H5.2A1.6 1.6 0 0 0 3.6 5.2v5.2c0 .42.17.83.47 1.13l8.4 8.4a1.6 1.6 0 0 0 2.26 0l5.2-5.2a1.6 1.6 0 0 0 0-2.26l-8.4-8.4a1.6 1.6 0 0 0-1.13-.47Z" /><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" /></S>;
export const Chat = (p) => <S {...p} sw={1.85}><path d="M4 6.6A2.6 2.6 0 0 1 6.6 4h10.8A2.6 2.6 0 0 1 20 6.6v7.2a2.6 2.6 0 0 1-2.6 2.6H9.6L4.8 20.2V6.6Z" /></S>;
export const Lock = (p) => <S {...p} sw={1.8}><rect x="4.6" y="10.4" width="14.8" height="10.2" rx="3.2" /><path d="M8 10.4V8a4 4 0 0 1 8 0v2.4" /></S>;
export const Close = (p) => <S {...p} sw={2.2}><path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6" /></S>;
export const Check = (p) => <S {...p} sw={3}><path d="m5.4 12.6 4.3 4.3 9-9.6" /></S>;
export const Verified = ({ size = 14, style }) => (
  <svg className="ic" width={size} height={size} viewBox="0 0 24 24" style={{ color: '#3d86ff', ...style }} aria-hidden="true">
    <path d="m12 1.9 2.6 2.2 3.4-.55 1.05 3.3 2.95 1.7-1.25 3.15L21.05 15l-2.95 1.7-1.05 3.3-3.4-.55L12 22.1l-2.65-2.25-3.4.55-1.05-3.3L1.95 15.4 3.2 12.25 1.95 9.1 4.9 7.4l1.05-3.3 3.4.55L12 1.9Z" fill="currentColor" />
    <path d="m8.4 12.1 2.4 2.4 4.8-5" fill="none" stroke="#0b0d12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const Camera = (p) => <S {...p} sw={1.8}><path d="M3.6 8.4h2.9l1.5-2.2h8l1.5 2.2h2.9a1.6 1.6 0 0 1 1.6 1.6v8a1.6 1.6 0 0 1-1.6 1.6H3.6A1.6 1.6 0 0 1 2 18v-8a1.6 1.6 0 0 1 1.6-1.6Z" /><circle cx="12" cy="13.4" r="3.4" /></S>;
export const Link = (p) => <S {...p} sw={1.9}><path d="M10.2 13.8a4 4 0 0 0 5.7 0l2.5-2.5a4 4 0 0 0-5.7-5.7l-1.3 1.3" /><path d="M13.8 10.2a4 4 0 0 0-5.7 0l-2.5 2.5a4 4 0 0 0 5.7 5.7l1.3-1.3" /></S>;
export const Trash = (p) => <S {...p} sw={1.85}><path d="M4.8 6.6h14.4M9.4 6.6V4.9h5.2v1.7M6.6 6.6l.9 13.1h9l.9-13.1" /></S>;
export const Sun = ({ size = 20, style }) => (
  <svg className="ic" width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true"
    fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.1" />
    <path d="M12 2.6v2.3M12 19.1v2.3M2.6 12h2.3M19.1 12h2.3M5.35 5.35l1.63 1.63M17.02 17.02l1.63 1.63M18.65 5.35l-1.63 1.63M6.98 17.02l-1.63 1.63" />
  </svg>
);
export const Moon = ({ size = 20, style }) => (
  <svg className="ic" width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true"
    fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round">
    <path d="M20.4 14.6A8.6 8.6 0 0 1 9.4 3.6a8.7 8.7 0 1 0 11 11Z" />
  </svg>
);
