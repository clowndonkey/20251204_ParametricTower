import type { BezierGraphState } from '../types/params';

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const CANVAS_SIZE = 240;
const PADDING = 18;
const GRAPH_SIZE = CANVAS_SIZE - PADDING * 2;

type HandleKey = 'p1' | 'p2';

export interface BezierGraphAPI {
  setVisible: (visible: boolean) => void;
  update: (state: BezierGraphState) => void;
}

export const createBezierGraph = (
  initial: BezierGraphState,
  onChange: (state: BezierGraphState) => void,
): BezierGraphAPI => {
  let state: BezierGraphState = { ...initial };
  let activeHandle: HandleKey | null = null;

  const overlay = document.createElement('div');
  overlay.className = 'bezier-overlay';
  overlay.style.display = 'none';
  overlay.style.left = '16px';
  overlay.style.top = '120px';

  const panel = document.createElement('div');
  panel.className = 'bezier-panel';
  overlay.appendChild(panel);

  const closeButton = document.createElement('button');
  closeButton.className = 'bezier-close';
  closeButton.type = 'button';
  closeButton.innerText = '×';
  panel.appendChild(closeButton);

  const dragHandle = document.createElement('div');
  dragHandle.className = 'bezier-drag-handle';
  panel.appendChild(dragHandle);

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  panel.appendChild(canvas);

  document.body.appendChild(overlay);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to acquire canvas context for Bezier graph');
  }

  const toCanvas = (point: { x: number; y: number }) => ({
    x: PADDING + point.x * GRAPH_SIZE,
    y: PADDING + (1 - point.y) * GRAPH_SIZE,
  });

  const fromCanvas = (x: number, y: number) => ({
    x: clamp((x - PADDING) / GRAPH_SIZE),
    y: clamp(1 - (y - PADDING) / GRAPH_SIZE),
  });

  const eventToCanvas = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const drawGrid = () => {
    ctx.save();
    ctx.fillStyle = '#1b1f2a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.strokeStyle = '#2a3142';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const divisions = 10;
    for (let i = 0; i <= divisions; i += 1) {
      const offset = PADDING + (GRAPH_SIZE / divisions) * i;
      ctx.moveTo(PADDING, offset);
      ctx.lineTo(PADDING + GRAPH_SIZE, offset);
      ctx.moveTo(offset, PADDING);
      ctx.lineTo(offset, PADDING + GRAPH_SIZE);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawCurve = () => {
    const start = toCanvas({ x: 0, y: 0 });
    const end = toCanvas({ x: 1, y: 1 });
    const cp1 = toCanvas({ x: state.x1, y: state.y1 });
    const cp2 = toCanvas({ x: state.x2, y: state.y2 });

    ctx.strokeStyle = '#ff4d4d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(cp1.x, cp1.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(cp2.x, cp2.y);
    ctx.stroke();

    ctx.strokeStyle = '#f4f5f7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    ctx.stroke();

    const drawHandle = (point: { x: number; y: number }, filled: boolean) => {
      ctx.beginPath();
      ctx.fillStyle = filled ? '#f4f5f7' : '#1b1f2a';
      ctx.strokeStyle = '#f4f5f7';
      ctx.lineWidth = 1.5;
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };

    drawHandle(start, true);
    drawHandle(end, true);
    drawHandle(cp1, false);
    drawHandle(cp2, false);
  };

  const render = () => {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid();
    drawCurve();
  };

  render();

  const findHandle = (x: number, y: number): HandleKey | null => {
    const cp1 = toCanvas({ x: state.x1, y: state.y1 });
    const cp2 = toCanvas({ x: state.x2, y: state.y2 });
    const dist = (pt: { x: number; y: number }) =>
      Math.hypot(pt.x - x, pt.y - y);

    if (dist(cp1) <= 12) return 'p1';
    if (dist(cp2) <= 12) return 'p2';
    return null;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!activeHandle) return;
    const { x, y } = eventToCanvas(event);
    const normalized = fromCanvas(x, y);

    if (activeHandle === 'p1') {
      state = { ...state, x1: normalized.x, y1: normalized.y };
    } else {
      state = { ...state, x2: normalized.x, y2: normalized.y };
    }

    render();
    onChange({ ...state });
  };

  const handlePointerUp = () => {
    activeHandle = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = eventToCanvas(event);
    const handle = findHandle(x, y);
    if (!handle) {
      return;
    }
    event.preventDefault();
    activeHandle = handle;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  });

  closeButton.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  const setOverlayPosition = (x: number, y: number) => {
    overlay.style.left = `${x}px`;
    overlay.style.top = `${y}px`;
  };

  const setVisible = (visible: boolean) => {
    overlay.style.display = visible ? 'flex' : 'none';
    overlay.style.pointerEvents = visible ? 'auto' : 'none';
  };

  let isDraggingOverlay = false;
  let dragOffset = { x: 0, y: 0 };

  const handleDragMove = (event: PointerEvent) => {
    if (!isDraggingOverlay) return;
    const nextX = event.clientX - dragOffset.x;
    const nextY = event.clientY - dragOffset.y;
    setOverlayPosition(nextX, nextY);
  };

  const handleDragEnd = () => {
    isDraggingOverlay = false;
    window.removeEventListener('pointermove', handleDragMove);
    window.removeEventListener('pointerup', handleDragEnd);
  };

  dragHandle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    isDraggingOverlay = true;
    const rect = overlay.getBoundingClientRect();
    dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    window.addEventListener('pointermove', handleDragMove);
    window.addEventListener('pointerup', handleDragEnd);
  });

  const update = (next: BezierGraphState) => {
    state = { ...next };
    render();
  };

  return {
    setVisible,
    update,
  };
};
