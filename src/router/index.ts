import { createRouter, createWebHistory } from 'vue-router';
import { authStore } from '../stores/auth'
import { supabase } from '../lib/supabase'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/feed',
      redirect: '/feed/all'
    },
    {
      path: '/providers',
      redirect: '/providers/all'
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      children: [
        {
          path: '/',
          name: 'landing',
          component: () => import('@/views/Landing.vue')
        },
        {
          path: '/privacy',
          name: 'privacy-policy',
          component: () => import('@/views/Privacy.vue')
        },
      ]
    },
    {
      path: '/feed/:type',
      name: 'feed',
      component: () => import('@/views/Feed.vue'),
      props: true
    },
    {
      path: '/providers/:type',
      name: 'providers',
      component: () => import('@/views/Providers.vue'),
      props: true
    },
    {
      path: '/providers/:type/:id',
      name: 'provider-details',
      component: () => import('@/views/Provider.vue'),
      props: true
    },
    {
      path: '/changes/:id',
      name: 'changes-details',
      component: () => import('@/views/Change.vue'),
      props: true
    },
    {
      path: '/alerts/',
      name: 'alerts',
      component: () => import('@/views/Alerts.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/alerts/new',
      name: 'create an alert',
      component: () => import('@/views/AlertCreate.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/changelogs',
      name: 'changelogs',
      component: () => import('@/views/Feed.vue'),
      props: { type: 'changelogs' },
      meta: { requiresAuth: true }
    },
    {
      path: '/changelogs/new',
      name: 'create-changelog',
      component: () => import('@/views/ChangelogCreate.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/changelogs/:changelogId',
      name: 'changelog-details',
      component: () => import('@/views/Feed.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/changelogs/:changelogId/:type',
      name: 'changelog-details-type',
      component: () => import('@/views/Feed.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/changelog/:changelogId',
      name: 'public-changelog',
      component: () => import('@/views/Feed.vue'),
      props: true
    },
    {
      path: '/changelog/:changelogId/:type',
      name: 'public-changelog-type',
      component: () => import('@/views/Feed.vue'),
      props: true
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      redirect: '/settings/channels',
      beforeEnter: (to, _, next) => {
        const token = to.query.token
        if (token) {
          next({ path: '/settings/channels', query: { token: token } })
        } else {
          next('/settings')
        }
      }
    },
    {
      path: '/settings',
      component: () => import('@/views/Settings.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '/settings',
          redirect: '/settings/profile'
        },
        {
          path: 'profile',
          name: 'settings-profile',
          component: () => import('@/views/SettingsProfile.vue'),
        },
        {
          path: 'theme',
          name: 'settings-theme',
          component: () => import('@/views/SettingsTheme.vue'),
        },
        {
          path: 'changelogs',
          name: 'settings-changelogs',
          component: () => import('@/views/SettingsChangelogs.vue'),
        },
        {
          path: 'channels',
          name: 'settings-channels',
          component: () => import('@/views/SettingsChannels.vue'),
        },
        {
          path: 'channels/new',
          name: 'settings-channels-create',
          component: () => import('@/views/ChannelCreate.vue'),
        },
        {
          path: 'channels/edit',
          name: 'settings-channels-edit',
          component: () => import('@/views/ChannelEdit.vue'),
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignUp.vue')
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/AuthCallback.vue')
    },
    {
      path: '/blog',
      name: 'BlogIndex',
      component: () => import('@/views/BlogIndex.vue')
    },
    {
      path: '/blog/:slug',
      name: 'BlogPost',
      component: () => import('@/views/BlogPost.vue'),
      props: true,
    },
  ],
  scrollBehavior() {
    // Always scroll to top when navigating to a new route
    return { top: 0 }
  }
})
// Authentication middleware
router.beforeEach(async (to, _, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (!requiresAuth) {
    return next()
  }

  try {
    // Fallback to getSession if authStore isn't initialized yet
    if (!authStore.session) {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      authStore.session = session // Sync store if needed
    }

    if (authStore.session) {
      return next() // Proceed if authenticated
    } else {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    // Redirect to login on error, assuming session is invalid
    return next({
      path: '/login',
      query: { redirect: to.fullPath, error: 'auth-failure' }
    })
  }
})

// Dynamically update document.title after each route change
router.afterEach((to) => {
  // Use meta.title if set, otherwise fallback to a default
  const defaultTitle = 'Superchange.ai | Your many changelogs in one source of truth';
  document.title = to.meta?.title ? String(to.meta.title) : defaultTitle;
});