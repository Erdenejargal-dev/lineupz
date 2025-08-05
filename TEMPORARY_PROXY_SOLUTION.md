# 🔧 TEMPORARY PROXY SOLUTION

## **Issue Still Persisting**
The frontend is still calling `https://tabi.mn/api/...` instead of `https://api.tabi.mn/api/...`. Since the frontend deployment might take time or have caching issues, let's create a temporary solution.

## **🚀 IMMEDIATE WORKAROUND - Add API Proxy to Main Domain**

### **Option 1: Vercel Rewrites (If using Vercel)**
Add this to your `next.config.ts` file:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.tabi.mn/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

### **Option 2: Netlify Redirects (If using Netlify)**
Create a `_redirects` file in your `public` folder:

```
/api/* https://api.tabi.mn/api/:splat 200
```

### **Option 3: Manual Nginx/Apache Config (If using custom server)**
Add this to your server config:

```nginx
location /api/ {
    proxy_pass https://api.tabi.mn/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## **🎯 What This Does**
- **Intercepts calls** to `https://tabi.mn/api/...`
- **Forwards them** to `https://api.tabi.mn/api/...`
- **Returns the response** back to the frontend
- **No frontend changes needed** - works with existing code

## **✅ Expected Result**
- ✅ `GET https://tabi.mn/api/subscription/current` → proxied to `https://api.tabi.mn/api/subscription/current`
- ✅ Subscription data loads properly
- ✅ No more 404 errors
- ✅ All API calls work through proxy

## **🚀 Quick Implementation**

### **For Vercel (Most Common):**
1. **Update next.config.ts** with the rewrite rule above
2. **Deploy:**
   ```bash
   git add next.config.ts
   git commit -m "Add API proxy"
   git push origin main
   ```

### **For Netlify:**
1. **Create `public/_redirects`** with the redirect rule above
2. **Deploy:**
   ```bash
   git add public/_redirects
   git commit -m "Add API redirects"
   git push origin main
   ```

## **🔧 Alternative: Update next.config.ts Now**

Let me update your next.config.ts file to include the proxy:
