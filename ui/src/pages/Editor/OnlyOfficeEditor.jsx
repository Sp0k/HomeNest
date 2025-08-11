import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const OnlyOfficeEditor = () => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [ready, setReady] = useState(false);

  const { i18n } = useTranslation();
  const params = new URLSearchParams(window.location.search);
  const path = params.get('path');
  const mode = params.get('mode') || 'edit';

  // Load the Document Server script once
  useEffect(() => {
    const base = (import.meta.env.VITE_ONLYOFFICE_URL || '').replace(/\/+$/, '');
    if (!base) { console.error('VITE_ONLYOFFICE_URL missing'); return; }
    const s = document.createElement('script');
    s.src = `${base}/web-apps/apps/api/documents/api.js`;
    s.onload = () => setReady(true);
    s.onerror = () => console.error('Failed to load OnlyOffice API script:', s.src);
    document.body.appendChild(s);
    return () => document.body.removeChild(s);
  }, []);

  // Init the editor
  useEffect(() => {
    if (!ready || !path || typeof window.DocsAPI === 'undefined') return;

    const apiBase = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');
    if (!apiBase) { console.error('VITE_API_BASE missing'); return; }

    let cleanup = () => {};

    (async () => {
      const res = await fetch(`${apiBase}/api/onlyoffice/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, mode }),
      });
      const text = await res.text();
      if (!res.ok) { console.error('config failed', res.status, text); return; }
      const cfg = JSON.parse(text);

      const el = containerRef.current;
      if (!el) return;
      if (!el.id) el.id = 'onlyoffice-editor';

      // Fill the container
      cfg.height = `${window.innerHeight}px`;
      cfg.lang = i18n.language || 'en';

      editorRef.current = new window.DocsAPI.DocEditor(containerRef.current.id, cfg);

      cleanup = () => {
        try { editorRef.current?.destroyEditor?.(); } catch {}
      };
    })();

    return () => cleanup();
  }, [ready, path, mode]);

  // Full-viewport container via portal
  return createPortal(
    <div
      ref={containerRef}
      id="placeholder"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    />,
    document.body
  );
};

export default OnlyOfficeEditor;
