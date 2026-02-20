import { APP_LOGO } from '../types';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export async function playBeep() {
  if (typeof window === 'undefined') return;
  // On mobile, native sound is preferred but we only have a beep here
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

export async function triggerSystemNotification(title: string, body: string, onPermissionUpdate?: (permission: any) => void) {
  if (Capacitor.isNativePlatform()) {
    try {
      const { display } = await LocalNotifications.checkPermissions();
      if (display !== 'granted') {
        const { display: newDisplay } = await LocalNotifications.requestPermissions();
        if (newDisplay !== 'granted') return;
      }
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: 1,
            extra: {
              data: 'emerald'
            },
            smallIcon: 'ic_stat_icon_config_sample' // This needs to be in android res
          }
        ]
      });
      return;
    } catch (e) {
      console.warn('Capacitor notifications failed', e);
    }
  }

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
