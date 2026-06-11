import { apiCoXacThuc, layAccessToken } from './auth'

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'

let dangKySubscriptionPromise: Promise<PushSubscription | null> | null = null
let daLangNgheNotificationClick = false

function coTheDangKyPush() {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PUBLIC_KEY !== 'YOUR_VAPID_PUBLIC_KEY_HERE')
}

export function kiemTraHoTroPush(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

export async function yeuCauQuyenThongBao(): Promise<NotificationPermission> {
  if (!kiemTraHoTroPush()) {
    throw new Error('Trình duyệt không hỗ trợ push notifications')
  }

  return Notification.requestPermission()
}

export async function dangKyPushSubscription(): Promise<PushSubscription | null> {
  if (dangKySubscriptionPromise) return dangKySubscriptionPromise

  dangKySubscriptionPromise = (async () => {
    try {
      if (!kiemTraHoTroPush() || !coTheDangKyPush()) return null
      if (Notification.permission !== 'granted') return null
      if (!layAccessToken()) return null

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
        })
      }

      await guiSubscriptionLenServer(subscription)
      return subscription
    } catch {
      return null
    } finally {
      dangKySubscriptionPromise = null
    }
  })()

  return dangKySubscriptionPromise
}

export async function huyDangKyPushSubscription(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) return false

    await subscription.unsubscribe()
    await xoaSubscriptionTrenServer(subscription)
    return true
  } catch {
    return false
  }
}

async function guiSubscriptionLenServer(subscription: PushSubscription): Promise<void> {
  if (!layAccessToken()) return

  try {
    await apiCoXacThuc('/thongbao/push-subscription', {
      method: 'POST',
      body: JSON.stringify(subscription),
    })
  } catch {}
}

async function xoaSubscriptionTrenServer(subscription: PushSubscription): Promise<void> {
  if (!layAccessToken()) return

  try {
    await apiCoXacThuc('/thongbao/push-subscription', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })
  } catch {}
}

export async function hienThiThongBaoTest(): Promise<void> {
  if (Notification.permission !== 'granted') {
    const permission = await yeuCauQuyenThongBao()
    if (permission !== 'granted') return
  }

  const registration = await navigator.serviceWorker.ready
  await registration.showNotification('Test Notification', {
    body: 'This is a test notification from IT Jobs DN',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'test-notification',
    requireInteraction: false,
  })
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

export function langNgheNotificationClick(): void {
  if (!('serviceWorker' in navigator) || daLangNgheNotificationClick) return

  daLangNgheNotificationClick = true
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'NOTIFICATION_CLICK' && event.data.url && window.location.href !== event.data.url) {
      window.location.href = event.data.url
    }
  })
}
