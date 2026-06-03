/**
 * Push Notifications Handler
 * Xử lý browser push notifications cho PWA
 */

import { apiCoXacThuc, layAccessToken } from './auth'

// VAPID public key (cần generate từ backend)
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'

/**
 * Kiểm tra trình duyệt có hỗ trợ push notifications không
 */
export function kiemTraHoTroPush(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * Yêu cầu quyền gửi notifications
 */
export async function yeuCauQuyenThongBao(): Promise<NotificationPermission> {
  if (!kiemTraHoTroPush()) {
    throw new Error('Trinh duyet khong ho tro push notifications')
  }

  const permission = await Notification.requestPermission()
  console.log('Notification permission:', permission)
  return permission
}

/**
 * Đăng ký push subscription
 */
export async function dangKyPushSubscription(): Promise<PushSubscription | null> {
  try {
    // Kiểm tra quyền
    if (Notification.permission !== 'granted') {
      const permission = await yeuCauQuyenThongBao()
      if (permission !== 'granted') {
        console.log('User denied notification permission')
        return null
      }
    }

    // Lấy service worker registration
    const registration = await navigator.serviceWorker.ready

    // Kiểm tra subscription hiện tại
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // Tạo subscription mới
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      })

      console.log('✅ Push subscription created:', subscription)

      // Gửi subscription lên server
      await guiSubscriptionLenServer(subscription)
    } else {
      console.log('✅ Push subscription already exists')
    }

    return subscription
  } catch (error) {
    console.error('❌ Error registering push subscription:', error)
    return null
  }
}

/**
 * Hủy đăng ký push subscription
 */
export async function huyDangKyPushSubscription(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      console.log('✅ Push subscription unsubscribed')

      // Xóa subscription trên server
      await xoaSubscriptionTrenServer(subscription)
      return true
    }

    return false
  } catch (error) {
    console.error('❌ Error unsubscribing push:', error)
    return false
  }
}

/**
 * Gửi subscription lên server
 */
async function guiSubscriptionLenServer(subscription: PushSubscription): Promise<void> {
  const token = layAccessToken()
  if (!token) return

  try {
    await apiCoXacThuc('/thongbao/push-subscription', {
      method: 'POST',
      body: JSON.stringify(subscription),
    })
    console.log('✅ Subscription sent to server')
  } catch (error) {
    console.error('❌ Error sending subscription to server:', error)
  }
}

/**
 * Xóa subscription trên server
 */
async function xoaSubscriptionTrenServer(subscription: PushSubscription): Promise<void> {
  const token = layAccessToken()
  if (!token) return

  try {
    await apiCoXacThuc('/thongbao/push-subscription', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })
    console.log('✅ Subscription removed from server')
  } catch (error) {
    console.error('❌ Error removing subscription from server:', error)
  }
}

/**
 * Hiển thị notification test
 */
export async function hienThiThongBaoTest(): Promise<void> {
  if (Notification.permission !== 'granted') {
    await yeuCauQuyenThongBao()
  }

  if (Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification('Test Notification', {
      body: 'This is a test notification from IT Jobs DN',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'test-notification',
      requireInteraction: false,
    })
  }
}

/**
 * Helper: Convert VAPID key
 */
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

/**
 * Lắng nghe notification click
 */
export function langNgheNotificationClick(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        console.log('Notification clicked:', event.data.url)
        // Navigate to URL
        if (event.data.url) {
          window.location.href = event.data.url
        }
      }
    })
  }
}
