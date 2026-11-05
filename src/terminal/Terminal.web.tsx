// Browser preview of the terminal: the same page in an iframe.
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { C } from '../ui/theme';
import type { TerminalProps } from './Terminal';

const page: string = require('./page.js');

export default function Terminal({ visible, mode, kind }: TerminalProps) {
  const frame = useRef<HTMLIFrameElement | null>(null);
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
      <iframe ref={frame} srcDoc={page} title="Terminal" style={{ border: 0, width: '100%', height: '100%' }} />
    </View>
  );
}
