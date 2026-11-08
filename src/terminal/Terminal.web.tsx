// Browser preview of the terminal: the same page in an iframe.
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { C } from '../ui/theme';
import type { TerminalProps } from './Terminal';

// The page is ~9 MB of JavaScript text. Requiring it at module scope would parse it before the first frame, which can trip
// iOS's launch watchdog on a real device, so it is loaded just after the app has drawn.
let pageText: string | null = null;
const loadPage = (): string => (pageText ??= require('./page.js') as string);

export default function Terminal({ visible, mode, kind }: TerminalProps) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const [page, setPage] = useState<string | null>(pageText);
  useEffect(() => { if (!page) { const id = setTimeout(() => setPage(loadPage()), 0); return () => clearTimeout(id); } }, [page]);
  const send = () => {
    const w = frame.current?.contentWindow as any;
    if (w?.__pt?.native) { w.__pt.native.setMode(mode, kind); return true; }
    return false;
  };
  useEffect(() => {
    if (send()) return;
    const id = setInterval(() => { if (send()) clearInterval(id); }, 300);
    return () => clearInterval(id);
  }, [mode, kind]);
  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: visible ? 1 : 0, zIndex: visible ? 2 : -1, backgroundColor: C.bg }}>
      {page ? <iframe ref={frame} srcDoc={page} title="Terminal" style={{ border: 0, width: '100%', height: '100%' }} /> : null}
    </View>
  );
}
