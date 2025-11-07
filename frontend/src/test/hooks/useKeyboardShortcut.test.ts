import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcut, useKeyboardShortcuts } from '../../hooks/useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call callback when key is pressed', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'b' }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: 'b' });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call callback when key with modifier is pressed', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 's', ctrlKey: true }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when modifier does not match', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 's', ctrlKey: true }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: 's' }); // No Ctrl
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback when key does not match', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'b' }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should be case insensitive', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'b' }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: 'B' });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not trigger in input elements by default', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'b' }, callback, [])
    );

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { key: 'b', bubbles: true });
    Object.defineProperty(event, 'target', { value: input, writable: false });
    input.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should trigger / key even in input elements', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: '/' }, callback, [])
    );

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { key: '/', bubbles: true });
    Object.defineProperty(event, 'target', { value: input, writable: false });
    input.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);

    document.body.removeChild(input);
  });

  it('should trigger Escape key even in input elements', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'Escape' }, callback, [])
    );

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    Object.defineProperty(event, 'target', { value: textarea, writable: false });
    textarea.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);

    document.body.removeChild(textarea);
  });

  it('should not call callback when disabled', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'b' }, callback, [], false)
    );

    const event = new KeyboardEvent('keydown', { key: 'b' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should preventDefault by default', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'b' }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: 'b' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not preventDefault when configured', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'b', preventDefault: false }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: 'b' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should cleanup event listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useKeyboardShortcut({ key: 'b' }, callback, [])
    );

    unmount();

    const event = new KeyboardEvent('keydown', { key: 'b' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle shift key modifier', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: '?', shiftKey: true }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: '?', shiftKey: true });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle alt key modifier', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'a', altKey: true }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: 'a', altKey: true });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle meta key modifier', () => {
    renderHook(() =>
      useKeyboardShortcut({ key: 'k', metaKey: true }, callback, [])
    );

    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('useKeyboardShortcuts', () => {
  it('should handle multiple shortcuts', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts([
        { config: { key: 'a' }, callback: callback1 },
        { config: { key: 'b' }, callback: callback2 },
      ])
    );

    const eventA = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(eventA);
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    const eventB = new KeyboardEvent('keydown', { key: 'b' });
    window.dispatchEvent(eventB);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should only trigger first matching shortcut', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts([
        { config: { key: 'a' }, callback: callback1 },
        { config: { key: 'a' }, callback: callback2 },
      ])
    );

    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();
  });

  it('should respect enabled flag', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts([
        { config: { key: 'a' }, callback: callback1, enabled: false },
        { config: { key: 'b' }, callback: callback2, enabled: true },
      ])
    );

    const eventA = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(eventA);
    expect(callback1).not.toHaveBeenCalled();

    const eventB = new KeyboardEvent('keydown', { key: 'b' });
    window.dispatchEvent(eventB);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should cleanup on unmount', () => {
    const callback = vi.fn();

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts([{ config: { key: 'a' }, callback }])
    );

    unmount();

    const event = new KeyboardEvent('keydown', { key: 'a' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });
});
