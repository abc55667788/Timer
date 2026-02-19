import { APP_LOGO } from '../types';

export function playBeep() {
  if (typeof window === 'undefined') return;
  const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtor) return;
  try {
    const ctx = new AudioCtor();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.frequency.value = 880;
    oscillator.type = 'triangle';
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
  } catch (err) {
    console.warn('Unable to play notification beep', err);
  }
}

export function triggerSystemNotification(title: string, body: string, onPermissionUpdate?: (permission: NotificationPermission) => void) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  const show = () => {
    try {
      new Notification(title, { 
        body,
        icon: APP_LOGO 
      });
      playBeep();
    } catch (err) {
      console.warn('Unable to display notification', err);
    }
  };

  const currentPermission = Notification.permission;
  if (currentPermission === 'granted') {
    show();
    return;
  }

  if (currentPermission === 'denied') {
    console.warn('Desktop notifications blocked by the user');
    if (onPermissionUpdate) onPermissionUpdate('denied');
    return;
  }

  Notification.requestPermission().then(permission => {
    if (onPermissionUpdate) onPermissionUpdate(permission);
    if (permission === 'granted') {
      show();
    }
  }).catch(err => {
    console.warn('Notification permission request failed', err);
  });
}
