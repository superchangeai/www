import { createRouter, createWebHistory } from 'vue-router';
import { authStore } from '../stores/auth'
import { supabase } from '../lib/supabase'
import { useHead } from '@unhead/vue';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/providers',
      redirect: '/providers/all'
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: {
        title: 'Superchange.ai | Your many changelogs in one source of truth',
        description: 'One central feed for all the updates from the tech providers you depend on.',
        ogImage: 'https://superchange.ai/superchange-small.png',
        ogUrl: 'https://superchange.ai',
      },
      children: [
        {
          path: '/',
          name: 'landing',
          component: () => import('@/views/Landing.vue')
        },
        {
          path: '/privacy',
          name: 'privacy-policy',
          component: () => import('@/views/Privacy.vue'),
          meta: {
            title: 'Superchange.ai | Privacy Policy',
            description: 'Read our privacy policy to understand how we handle your data.',
            ogImage: 'https://superchange.ai/superchange-small.png',
            ogUrl: 'https://superchange.ai/privacy',
          },
        },
      ]
    },
    {
      path: '/feed/',
      name: 'feed',
      component: () => import('@/views/Feed.vue'),
      props: true,
      meta: {
        title: 'Superchange.ai | Changelog Feed',
        description: 'Explore the latest changelog updates from various providers.',
        ogImage: 'https://superchange.ai/superchange-small.png',
        helpDoc: 'how-to-browse-changes'
      },
    },
    {
      path: '/feed/:type',
      name: 'feed-filter',
      component: () => import('@/views/Feed.vue'),
      props: true,
      meta: {
        title: 'Superchange.ai | Changelog Feed',
        description: 'Explore the latest changelog updates from various providers.',
        ogImage: 'https://superchange.ai/superchange-small.png',
        helpDoc: 'how-to-filter-changes'
      },
    },
    {
      path: '/providers/:type',
      name: 'providers',
      component: () => import('@/views/Providers.vue'),
      props: true,
      meta: {
        title: 'Superchange.ai | Providers',
        description: 'Browse all tech providers and their changelog updates.',
        ogImage: 'https://superchange.ai/superchange-small.png',
        helpDoc: 'how-to-track-providers'
      },
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
      props: true,
      meta: {
        title: 'Superchange.ai | Change recorded and classified with AI',
        description: 'Find out what this tech provider shipped!',
        ogImage: 'https://superchange.ai/superchange-small.png'
      }
    },
    {
      path: '/alerts/',
      name: 'alerts',
      component: () => import('@/views/Alerts.vue'),
      props: true,
      meta: {
        requiresAuth: true,
        title: 'Superchange.ai | Smart alerts',
        description: 'Keep up with your providers, never miss a critical change again!',
        ogImage: 'https://superchange.ai/superchange-small.png',
        ogUrl: 'https://superchange.ai/alerts',
        helpDoc: 'how-to-use-smart-alerts'
      }
    },
    {
      path: '/alerts/new',
      name: 'create an alert',
      component: () => import('@/views/AlertCreate.vue'),
      props: true,
      meta: { 
        requiresAuth: true,
        title: 'Superchange.ai | Create an alert',
        helpDoc: 'how-to-set-up-an-alert' 
      }
    },
    {
      path: '/changelogs',
      name: 'changelogs',
      component: () => import('@/views/Feed.vue'),
      props: { type: 'changelogs' },
      meta: { requiresAuth: true, helpDoc: 'how-to-browse-changes' }
    },
    {
      path: '/changelogs/new',
      name: 'create-changelog',
      component: () => import('@/views/ChangelogCreate.vue'),
      meta: { requiresAuth: true, title: 'Superchange.ai | Create a custom changelog', helpDoc: 'how-to-create-a-custom-changelog' }
    },
    {
      path: '/changelogs/:id/edit',
      name: 'edit-changelog',
      component: () => import('@/views/ChangelogEdit.vue'),
      meta: { requiresAuth: true, title: 'Superchange.ai | Edit changelog', }
    },
    {
      path: '/changelogs/:changelogId',
      name: 'changelog-details',
      component: () => import('@/views/Feed.vue'),
      props: true,
      meta: { 
        requiresAuth: true, 
        title: 'Superchange.ai | A changelog for everything you build on', 
        description: 'Keep up with your providers, never miss a critical change again!',
        ogImage: 'https://superchange.ai/superchange-small.png', helpDoc: 'how-to-browse-changes' }
    },
    {
      path: '/changelogs/:changelogId/:type',
      name: 'changelog-details-type',
      component: () => import('@/views/Feed.vue'),
      props: true,
      meta: { 
        requiresAuth: true, 
        title: 'Superchange.ai | A changelog for everything you build on', 
        description: 'Keep up with your providers, never miss a critical change again!',
        ogImage: 'https://superchange.ai/superchange-small.png' }
    },
    {
      path: '/changelog/:changelogId',
      name: 'public-changelog',
      component: () => import('@/views/Feed.vue'),
      props: true,
      meta: { 
        title: 'Superchange.ai | A changelog for everything you build on', 
        description: 'Keep up with your providers, never miss a critical change again!',
        ogImage: 'https://superchange.ai/superchange-small.png',
        helpDoc: 'how-to-browse-changes'
      }
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
      meta: { requiresAuth: true, title: 'Superchange.ai | Settings'},
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
          meta: { helpDoc: 'how-to-configure-changelogs' },
        },
        {
          path: 'channels',
          name: 'settings-channels',
          component: () => import('@/views/SettingsChannels.vue'),
          meta: { helpDoc: 'how-to-configure-channels' },
        },
        {
          path: 'channels/new',
          name: 'settings-channels-create',
          component: () => import('@/views/ChannelCreate.vue'),
          meta: { helpDoc: 'how-to-set-up-a-channel' },
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
      component: () => import('@/views/Login.vue'),
      meta: {
        title: 'Superchange.ai | Login',
        description: 'Log in to access your personalized changelog feed.',
        ogImage: 'https://superchange.ai/superchange-small.png',
        ogUrl: 'https://superchange.ai/login',
      },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/SignUp.vue'),
      meta: {
        title: 'Superchange.ai | Signup',
        description: 'Get started with Superchange: build your own changelogs and create custom alerts.',
        ogImage: 'https://superchange.ai/superchange-small.png',
        ogUrl: 'https://superchange.ai/signup',
        helpDoc: 'how-to-become-a-member'
      },
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/views/AuthCallback.vue')
    },
    {
      path: '/blog',
      name: 'BlogIndex',
      component: () => import('@/views/BlogIndex.vue'),
      meta: {
        title: 'Superchange.ai | Blog',
        description: 'Read the latest blog posts from Superchange.ai.',
        ogImage: 'https://superchange.ai/superchange-small.png',
      },
    },
    {
      path: '/blog/:slug',
      name: 'BlogPost',
      component: () => import('@/views/BlogPost.vue'),
      props: true,
      meta: {
        // Dynamic title and description will be set in navigation guard or component
        title: 'Superchange.ai | Blog',
        description: 'Read the latest news and research published on Superchange.ai.',
        ogImage: 'https://superchange.ai/superchange-small.png',
      },
    },
    {
      path: '/:pathMatch(.*)*', // Catch-all route for 404
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        title: 'Superchange.ai | Page Not Found',
        description: 'The page you are looking for does not exist.',
        ogImage: 'https://superchange.ai/superchange-small.png',
        ogUrl: 'https://superchange.ai/404',
      },
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
  useHead({
    title: to.meta.title || 'Superchange.ai | Your many changelogs in one source of truth',
    meta: [
      { name: 'description', content: String(to.meta.description || 'One central feed for all the updates from the tech providers you depend on.') },
      { property: 'og:title', content: String(to.meta.title || 'Superchange.ai - Your changelog of all changelogs') },
      { property: 'og:description', content: String(to.meta.description || 'One central feed for all the updates from the tech providers you depend on.') },
      { property: 'og:image', content: String(to.meta.ogImage || 'https://superchange.ai/superchange-small.png') },
      { property: 'og:url', content: String(to.meta.ogUrl || `https://superchange.ai${to.fullPath}`) },
      { name: 'twitter:image', content: String(to.meta.ogImage || 'https://superchange.ai/superchange-small.png') },
    ],
  });
});