self.addEventListener('push', function(event) {
  let payload = {}
  try { payload = event.data ? event.data.json() : {} } catch {}
  const title = payload.title || 'Size Seeker'
  const options = {
    body: payload.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.url || '/'
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  const url = event.notification.data || '/'
  event.waitUntil(clients.openWindow(url))
})

