// Service Worker文件，用于拦截/@vite/client请求
// 安装Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker 已安装');
  // 立即激活Service Worker，不等待旧的Service Worker被替换
  self.skipWaiting();
});
// 激活Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker 已激活');
  // 接管所有页面
  event.waitUntil(clients.claim());
});
// 拦截所有网络请求
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // 拦截/@vite/client请求
  if (url.pathname === '/@vite/client' || url.pathname.startsWith('/@vite/client?')) {
    console.log('Service Worker 已拦截/@vite/client请求:', url.toString());
    // 返回一个空的JavaScript文件作为响应
    event.respondWith(
      new Response('', {
        status: 200,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-store'
        }
      })
    );
    return;
  }
  // 对于其他请求，让它们继续正常处理
  event.respondWith(fetch(event.request));
});
