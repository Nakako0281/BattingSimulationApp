# デプロイメントガイド / Deployment Guide

野球打撃シミュレーターを本番環境にデプロイする手順です。

## 事前準備

- Node.js 18以上
- Supabaseプロジェクト設定済み
- Gitリポジトリ
- デプロイプラットフォームアカウント（Vercel推奨）

## デプロイ前チェックリスト

- [ ] 全てのテストが成功 (`npm test`)
- [ ] ビルドがローカルで成功 (`npm run build`)
- [ ] 環境変数が `.env.example` に文書化
- [ ] Supabaseマイグレーション実行済み
- [ ] 本番ビルドでコンソールエラーなし
- [ ] アクセシビリティ監査合格
- [ ] パフォーマンス指標が許容範囲

## Deploying to Vercel (Recommended)

### 1. Prepare Your Repository

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Select the repository

### 3. Configure Project

**Framework Preset**: Next.js

**Root Directory**: `./` (default)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

### 4. Set Environment Variables

Add all variables from `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 5. Deploy

Click "Deploy" and wait for the build to complete.

### 6. Verify Deployment

1. Check deployment logs for errors
2. Visit the deployment URL
3. Test authentication flow
4. Create a test team and players
5. Run simulation
6. Check all navigation links

## Database Setup (Supabase)

### 1. Run Migrations

Execute SQL files in order:

```sql
-- 1. Create tables
\i supabase/schema.sql

-- 2. Setup RLS policies
\i supabase/fix-rls.sql

-- 3. Create simulation results table
\i supabase/simulation-results.sql
```

### 2. Verify Tables

Check that all tables exist:
- `users`
- `teams`
- `players`
- `simulation_results`

### 3. Test RLS Policies

1. Create a test user
2. Try accessing data from different users
3. Verify users can only see their own data

## Custom Domain (Optional)

### 1. Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records

### 2. Update Environment Variables

```env
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Force Redeploy

Trigger a new deployment to apply updated environment variables.

## Alternative Deployment Platforms

### Netlify

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables
5. Deploy

### Self-Hosted (VPS)

#### Requirements
- Node.js 18+
- PM2 or similar process manager
- Nginx for reverse proxy
- SSL certificate

#### Steps

1. **Clone repository**
```bash
git clone your-repo-url
cd BattingSimulationApp
```

2. **Install dependencies**
```bash
npm ci --production
```

3. **Build application**
```bash
npm run build
```

4. **Configure environment**
```bash
cp .env.example .env.production
# Edit .env.production with production values
```

5. **Start with PM2**
```bash
pm2 start npm --name "batting-sim" -- start
pm2 save
pm2 startup
```

6. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Setup SSL with Certbot**
```bash
sudo certbot --nginx -d your-domain.com
```

## Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Monitor performance metrics
- Track Web Vitals

### Error Tracking (Optional)
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Datadog for APM

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Self-Hosted
```bash
git log --oneline
git checkout <previous-commit-hash>
npm run build
pm2 restart batting-sim
```

## Performance Optimization

### 1. Enable Compression
Vercel handles this automatically

### 2. CDN Configuration
Static assets automatically served via Vercel Edge Network

### 3. Database Connection Pooling
Configure Supabase connection pooling in project settings

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] RLS policies tested
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

## Troubleshooting

### Build Fails
- Check build logs in deployment platform
- Verify all dependencies in package.json
- Test build locally: `npm run build`

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies
- Test connection from production environment

### Authentication Not Working
- Verify NEXTAUTH_URL matches deployment URL
- Check NEXTAUTH_SECRET is set
- Test callback URLs

### Performance Issues
- Enable Vercel Analytics
- Check database query performance
- Review bundle size: `npm run build` shows bundle analysis
- Consider implementing caching strategies

## Support

For deployment issues:
1. Check deployment logs
2. Review this documentation
3. Consult Next.js deployment docs
4. Check Supabase status page

## Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
