import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UtilityMascot } from './UtilityMascot';

const getRouteInfo = (pathname) => {
  if (/^\/(bills|utilities|usage)/.test(pathname)) return { title: 'Utility bills', kind: 'water', tag: 'BILLS & USAGE' };
  if (/^\/(payments|splits|autopay)/.test(pathname)) return { title: 'Payments', kind: 'electricity', tag: 'PAYMENTS & SPLITS' };
  if (/^\/(disputes|customer-care|account-services)/.test(pathname)) return { title: 'Support center', kind: 'internet', tag: 'HOUSEHOLD SUPPORT' };
  if (/^\/(admin)/.test(pathname)) return { title: 'Admin workspace', kind: 'internet', tag: 'CONTROL CENTER' };
  if (/^\/(household|members)/.test(pathname)) return { title: 'Your household', kind: 'electricity', tag: 'HOUSEHOLD SPACE' };
  if (/^\/(predictions|reports|loyalty)/.test(pathname)) return { title: 'Insights & rewards', kind: 'internet', tag: 'SMART INSIGHTS' };
  if (pathname === '/notifications') return { title: 'Notifications', kind: 'water', tag: 'HOUSEHOLD UPDATES' };
  if (pathname === '/profile') return { title: 'Your profile', kind: 'electricity', tag: 'ACCOUNT SETTINGS' };
  if (pathname === '/login') return { title: 'Welcome back', kind: 'electricity', tag: 'SECURE SIGN IN' };
  if (pathname === '/register') return { title: 'Join your household', kind: 'water', tag: 'GETTING STARTED' };
  return { title: 'SmartSplit', kind: 'electricity', tag: 'SHARED UTILITY CONTROL' };
};

export const RouteSwitchAnimation = () => {
  const { pathname } = useLocation();
  const [transition, setTransition] = useState(null);
  const previousPath = useRef(pathname);
  const sequence = useRef(0);

  useEffect(() => {
    if (previousPath.current === pathname) return undefined;
    previousPath.current = pathname;
    sequence.current += 1;
    setTransition({ ...getRouteInfo(pathname), id: sequence.current });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setTransition(null), reducedMotion ? 260 : 780);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!transition) return null;

  return (
    <div className="route-switch-overlay" key={transition.id} data-kind={transition.kind} aria-hidden="true">
      <div className="route-switch-scene">
        <div className="route-switch-orbit route-switch-orbit-back" />
        <div className="route-switch-trail route-switch-trail-left"><span>SMART</span><i>✦</i></div>
        <div className="route-switch-trail route-switch-trail-right"><span>HOME</span><i>⌂</i></div>
        <div className="route-switch-card">
          <div className="route-switch-card-top"><span className="route-switch-dot" /><span>{transition.tag}</span></div>
          <div className="route-switch-orbit route-switch-orbit-front" />
          <div className="route-switch-mascot"><UtilityMascot kind={transition.kind} /></div>
          <strong>{transition.title}</strong>
          <div className="route-switch-progress"><span /></div>
        </div>
        <div className="route-switch-orbit route-switch-orbit-frontmost" />
      </div>
    </div>
  );
};
