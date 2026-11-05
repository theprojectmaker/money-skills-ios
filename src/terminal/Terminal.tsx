// The Trade and Predict tabs: one web view holding the charting terminal (built from tests/paper-trader by tools/build-native.mjs).
// It stays mounted so switching tabs is instant and drawings, orders and zoom survive. Saved data is mirrored to AsyncStorage,
// because a web view's localStorage can be cleared by the system.
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '../ui/theme';
import { createRelay } from './relay';

const page: string = require('./page.js');
const KEY = 'terminal:v1';
const relay = createRelay();

export type TerminalProps = { visible: boolean; mode: 'trade' | 'predict'; kind: string | null };

const setModeJs = (mode: string, kind: string | null) =>
  `window.__pt&&window.__pt.native&&window.__pt.native.setMode(${JSON.stringify(mode)},${JSON.stringify(kind)});true;`;

const restoreJs = (saved: string | null) => `(function(){try{
  var has=false;for(var i=0;i<localStorage.length;i++){if((localStorage.key(i)||'').indexOf('papertrader:')===0){has=true;break;}}
  if(!has){var d=${JSON.stringify(saved)};if(d){d=JSON.parse(d);for(var k in d){localStorage.setItem(k,d[k]);}}}
}catch(e){}})();true;`;

export default function Terminal({ visible, mode, kind }: TerminalProps) {
  const ref = useRef<WebView>(null);
  const ready = useRef(false);
  const [saved, setSaved] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(setSaved, () => setSaved(null));
  }, []);

  useEffect(() => {
    if (ready.current) ref.current?.injectJavaScript(setModeJs(mode, kind));
  }, [mode, kind]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ready') {
        ready.current = true;
        ref.current?.injectJavaScript(setModeJs(mode, kind));
      } else if (msg.type === 'relay') {
        const reply = (ok: boolean, payload: string) => ref.current?.injectJavaScript('window.__nativeRelay&&window.__nativeRelay(' + msg.id + ',' + ok + ',' + JSON.stringify(payload) + ');true;');
        relay(msg.op, msg.params).then((text) => reply(true, text), (err) => reply(false, String(err?.message ?? err)));
      } else if (msg.type === 'save') {
        AsyncStorage.setItem(KEY, msg.data).catch(() => {});
      }
    } catch { /* not one of ours */ }
  };

  return (
    <View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: visible ? 1 : 0, zIndex: visible ? 2 : -1, backgroundColor: C.bg }}
    >
      {saved === undefined ? null : (
        <WebView
          ref={ref}
          originWhitelist={['*']}
          source={{ html: page, baseUrl: 'https://terminal.local/' }}
          injectedJavaScriptBeforeContentLoaded={restoreJs(saved)}
          onMessage={onMessage}
          onShouldStartLoadWithRequest={(r) => r.url.startsWith('https://terminal.local') || r.url.startsWith('about:') || r.url.startsWith('blob:') || r.url.startsWith('data:')}
          onContentProcessDidTerminate={() => { ready.current = false; ref.current?.reload(); }}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          allowsLinkPreview={false}
          hideKeyboardAccessoryView
          keyboardDisplayRequiresUserAction={false}
          setSupportMultipleWindows={false}
          domStorageEnabled
          javaScriptEnabled
          style={{ flex: 1, backgroundColor: C.bg }}
        />
      )}
    </View>
  );
}
