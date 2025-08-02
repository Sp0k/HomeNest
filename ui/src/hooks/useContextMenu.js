import { useState } from 'react';

export default function useContextMenu() {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const onContextMenu = (e, item) => {
    e.preventDefault();
    setCurrent(item);
    setAnchorPoint({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  const closeMenu = () => setOpen(false);

  return { open, current, anchorPoint, onContextMenu, closeMenu };
}
