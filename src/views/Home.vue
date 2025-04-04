<template>
    <div class="flex flex-col min-h-screen bg-background text-foreground">
    <header class="py-6 border-b border-border">
      <div class="container mx-auto px-8 flex justify-between items-center">
        <div class="flex items-center gap-2">
            <img src="/super.svg" alt="Superchange.ai logo" class="h-6" />
            <span class="font-semibold text-lg">superchange.ai</span>
            <Badge variant="outline">beta</Badge>
        </div>
        <nav class="flex gap-8 items-center">
          <a href="#features" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Features</a>
          <a href="#alerts" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Alerts</a>
          <a href="#roadmap" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Roadmap</a>
          <a href="https://github.com/superchangeai" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 flex gap-2 items-center"><Github class="xs" /> GitHub</a>
          <router-link :to="'/feed/'">
            <Button size="xxl">
              Browse the changes
            </Button>
          </router-link>
        </nav>
      </div>
    </header>

    <main>
      <section class="relative bg-gradient-to-br from-[#0d0d0e] via-[#151b26] to-[#1a2540] bg-blend-overlay min-h-[450px]" ref="heroSection">
        <div class="container mx-auto px-8 flex gap-2 items-center justify-between">
        <div class="w-[75%] text-left">
                <h1 class="text-6xl font-extrabold mb-6 leading-tight">The changelog of changelogs.</h1>
                <p class="py-2 text-md text-muted-foreground max-w-3xl mb-8">One central feed for all the updates from the tech providers you depend on. <br> Never miss a breaking change again.</p>
                <div class="flex gap-4 mt-4">
                  <router-link :to="'/feed/'">
                    <Button size="xxl">
                      Browse the changes
                    </Button>
                  </router-link>
                  <!-- <router-link :to="'/docs'">
                    <Button size="xxl" variant="secondary">
                      Explore the docs
                    </Button>
                  </router-link> -->
                </div>
        </div>
        <img src="/superchange.png" alt="Superchange.ai homepage" class="w-[35%]" />
        </div>
        <div class="absolute top-1/2 right-[-16%] transform translate-y-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(0,136,255,0.3),transparent_70%)] z-0 pointer-events-none blur-[60px]"></div>
    </section>

      <section id="features" class="feature-section">
        <div class="container">
          <h2 class="section-heading">One changelog for everything you build on</h2>
          <p class="section-description">API changelogs, AI models lifecycle, Framework release notes – important updates are scattered everywhere. <br> Critical changes often get buried in documentation, and must-do migrations go unnoticed until it's too late.</p>
          
          <div class="features-grid">
            <div class="feature-card flex flex-col items-center text-center">
              <span><PanelsTopLeft /></span>
              <h3 class="feature-title">Centralized updates</h3>
              <p class="text-muted-foreground">Aggregates changelogs from countless providers into a single feed that's refreshed daily.</p>
            </div>
            <div class="feature-card flex flex-col items-center text-center">
              <Sparkles />
              <h3 class="feature-title">Automatic classification</h3>
              <p class="text-muted-foreground">Uses AI to tag each update (security patch, breaking change, performance tweak, etc.) and provide a concise summary for quick scanning.</p>
            </div>
            <div class="feature-card flex flex-col items-center text-center">
              <SearchCheck />
              <h3 class="feature-title">Full transparency</h3>
              <p class="text-muted-foreground">Every entry links back to the official source. You can always get details in the original notes or docs.</p>
            </div>
          </div>
          <div class="changelog-demo">
            <img src="/ui-changes-feed.png" alt="Superchange.ai dashboard showing unified changelog" />
          </div>
        </div>
      </section>

      <section id="alerts" class="feature-section">
        <div class="container">
          <h2 class="section-heading">Updates that actually update you</h2>
          <p class="section-description">There's a fine line between missing crucial updates and getting drowned in noise. <br> Superchange.ai lets you control that balance with smart, filtered alerts.</p>
          
          <div class="alert-demo">
            <img src="/ui-alert-action.png" alt="Creating a custom alert in Superchange.ai" />
          </div>
          
          <div class="features-grid">
            <div class="feature-card flex flex-col items-center text-center">
              <Bot />
              <h3 class="feature-title">1. Your providers</h3>
              <p class="feature-description">Select the services, APIs, libraries, or platforms you care about. We curate what we use and love – you too can <br>contribute with providers you need.</p>
            </div>
            <div class="feature-card flex flex-col items-center text-center">
              <TriangleAlert />
              <h3 class="feature-title">2. Your priorities</h3>
              <p class="feature-description">Choose the types of updates you want to know about – security fixes, breaking changes, performance improvements, new features – and skip the rest.</p>
            </div>
            <div class="feature-card flex flex-col items-center text-center">
              <Clock4 />
              <h3 class="feature-title">3. Your schedule</h3>
              <p class="feature-description">Decide how and when updates get delivered. Get instant notifications in Slack, a daily email digest, a weekly summary, or even route updates to a custom webhook.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="roadmap" class="feature-section">
        <div class="container">
          <h2 class="section-heading">There's way more.</h2>
          <p class="section-description">This is just the beginning – Superchange.ai's roadmap is packed with developer-friendly enhancements:</p>
          
          <div class="coming-soon">
            <div class="coming-soon-item">
              <div class="coming-soon-title">
                <span>AI Agent-ready (<a href="https://api.superchange.ai/v1/llms.txt">LLMs.txt</a>)</span>
                <Badge>live</Badge>
              </div>
              <p class="coming-soon-description">Access changes through <a href="https://api.superchange.ai/v1/llms.txt">LLMs.txt</a>, making it easy for AI coding assistants and IDEs to consume Superchange.ai</p>
            </div>
            <div class="coming-soon-item">
              <div class="coming-soon-title">
                <span>Community-driven expansion</span>
                <Badge>ongoing</Badge>
              </div>
              <p class="coming-soon-description">New providers are added based on your requests – if your stack relies on it, we'll likely support it. (Contributions welcome, this is open source!)</p>
            </div>
            <div class="coming-soon-item">
              <div class="coming-soon-title">
                <span>CI/CD integration</span>
                <Badge variant="outline">coming soon</Badge>
              </div>
              <p class="coming-soon-description">GitHub Actions support is planned, so you can automate update checks in your build or deployment pipeline.</p>
            </div>
            <div class="coming-soon-item">
              <div class="coming-soon-title">
                <span>MCP compatibility</span>
                <Badge variant="outline">coming later</Badge>
              </div>
              <p class="coming-soon-description">Integration with Anthropic's Model Context Protocol (MCP), allowing AI agents to query your unified changelog directly.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section relative bg-background">
        <div class="container z-10 relative flex flex-col items-center">
          <h2>Boring Stuff, Done Better</h2>
          <p>Superchange.ai was created by a product manager who spent a decade building APIs and developer platforms — and constantly struggled to keep up with others' changelogs. It's built to be transparent and reliable from day one.</p>
          <div class="buttons z-10 relative">
            <a href="/feed" class="btn btn-primary">Join the Public Beta</a>
          </div>
        </div>
        <div class="absolute inset-0 z-0 bg-curves"></div>
    </section>
    </main>

    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <div class="logo-icon flex gap-2 items-center">
              <img src="/super.svg"> <span class="logo-text">superchange.ai</span>
            </div>
          </div>
          <div class="footer-links">
            <a href="#features" class="footer-link">Features</a>
            <a href="#alerts" class="footer-link">Alerts</a>
            <a href="#roadmap" class="footer-link">Roadmap</a>
            <a href="https://github.com/superchangeai" class="footer-link">GitHub</a>
            <a href="/docs" class="footer-link">Documentation</a>
            <a href="/privacy" class="footer-link">Privacy</a>
            <a href="/terms" class="footer-link">Terms</a>
          </div>
        </div>
        <div class="copyright">
          &copy; 2025 Superchange.ai. All rights reserved.
        </div>
      </div>
    </footer>

  </div>
  </template>
  
  <script setup>
    import { ref, onMounted } from 'vue'
    import { useColorMode } from '@vueuse/core'
    import { Button } from '@/components/ui/button'
    import { Badge } from '@/components/ui/badge'
    import { PanelsTopLeft, Sparkles, TriangleAlert, SearchCheck, Bot, Clock4, Github } from 'lucide-vue-next'
    import { RouterLink } from 'vue-router'
    const mode = useColorMode()
    
</script>
  
  <style>
  * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      line-height: 1.6;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    header {
      padding: 1.5rem 0;
      border-bottom: 1px solid hsl(var(--border));
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
    }

    .logo-text {
      font-weight: 600;
      font-size: 1.2rem;
    }

    .nav {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .nav-link {
      color: hsl(var(--muted-foreground));
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s;
    }

    .nav-link:hover {
      color: hsl(var(--foreground));
    }

    .hero {
        background: linear-gradient(135deg, #0d0d0e 0%, #151b26 50%, #1a2540 100%);        background-blend-mode: overlay;
        position: relative;
    }
    .hero::after {
        content: "";
        position: absolute;
        top: 50%;
        right: -16%;
        transform: translateY(-10%);
        width: 600px;
        height: 600px;
        background: radial-gradient(circle at center, rgba(0, 136, 255, 0.3), transparent 70%);
        z-index: 0;
        pointer-events: none;
        filter: blur(60px);
    }

    .hero h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      line-height: 1.1;
    }

    .hero p {
      font-size: 1.2rem;
      color: hsl(var(--muted-foreground));
      max-width: 800px;
      margin: 1em auto;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.25rem;
      font-weight: 500;
      text-decoration: none;
      transition: opacity 0.2s;
    }

    .btn:hover {
      opacity: 0.9;
      color: white;
    }

    .btn-primary {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }

    .btn-secondary {
      background-color: hsl(var(--secondary));
      color: hsl(var(--secondary-foreground));
    }

    .feature-section {
      padding: 5rem 0;
      position: relative;
    }
    .feature-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
        90deg,
        transparent,
        hsl(var(--primary) / 0.2),
        hsl(var(--primary) / 0.7),
        hsl(var(--primary) / 0.2),
        transparent
        );
        box-shadow: 
        0 0 10px hsl(var(--primary) / 0.3),
        0 0 20px hsl(var(--primary) / 0.2),
        0 0 30px hsl(var(--primary) / 0.1);
    }

    #alerts {
      background-color: hsl(var(--muted));
    }

    .section-heading {
      font-size: 2.25rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
    }

    .section-description {
      font-size: 1.125rem;
      color: hsl(var(--muted-foreground));
      margin-bottom: 3rem;
    }

    .cta-section {
      text-align: center;
      padding: 6rem 0;
      position: relative;
    }
    .cta-section::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 0.5rem;
      padding: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.3),
        rgba(255, 255, 255, 0.1),
        transparent
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    .cta-section h2 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
    }

    .cta-section p {
      font-size: 1.125rem;
      color: hsl(var(--muted-foreground));
      max-width: 800px;
      margin: 0 auto;
      margin-bottom: 2.5rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background-color: hsl(var(--card));
      border-radius: 0.5rem;
      padding: 2rem;
      border: 1px solid hsl(var(--border));
    }

    .feature-card svg {
      width: 40px;
      height: 40px;
      margin-bottom: 1rem;
      color: hsl(var(--primary));
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .feature-description {
      color: hsl(var(--muted-foreground));
      font-size: 0.95rem;
    }

    .changelog-demo {
      margin: 4rem 0;
      border-radius: 0.5rem;
      overflow: hidden;
      position: relative;
      box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);
    }

    .changelog-demo::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 0.5rem;
      padding: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.3),
        rgba(255, 255, 255, 0.1),
        transparent
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    .alert-demo {
      border-radius: 0.5rem;
      overflow: hidden;
      margin: 2rem 0;
      position: relative;
      box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);
    }

    .alert-demo::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 0.5rem;
      padding: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0.3),
        rgba(255, 255, 255, 0.1),
        transparent
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
    }

    .coming-soon {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .coming-soon-item {
      background-color: hsl(var(--card));
      border: 1px solid hsl(var(--border));
      border-radius: 0.5rem;
      padding: 1.5rem;
      flex: 1 1 calc(50% - 0.75rem);
      min-width: 250px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .coming-soon-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
    }

    .soon {
      background-color: hsl(var(--border));
      color: hsl(var(--secondary-foreground));
    }

    .coming-soon-description {
      color: hsl(var(--muted-foreground));
      font-size: 0.95rem;
    }

    .bg-curves {
        background-image: url('/durves-white.svg');
        background-repeat: repeat;
        background-position: center;
        background-position-y: -100px;
        background-size: 100% 100%;
        opacity: 0.1;
        transform: rotate(180deg)
    }

    footer {
      padding: 3rem 0;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .footer-links {
      display: flex;
      gap: 2rem;
    }

    .footer-link {
      color: hsl(var(--muted-foreground));
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .footer-link:hover {
      color: hsl(var(--foreground));
    }

    .copyright {
      color: hsl(var(--muted-foreground));
      font-size: 0.9rem;
      margin-top: 2rem;
      text-align: center;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2.5rem;
      }
      
      .nav {
        display: none;
      }

      .hero {
        padding: 2rem 0;
      }

      .hero p {
        display: none;
      }
      
      .buttons {
        flex-direction: column;
        align-items: center;
        width: auto;
      }
      
      .buttons a {
        width: 100%;
        margin-bottom: 1rem;
      }
      
      .footer-content {
        flex-direction: column;
        gap: 2rem;
      }
      
      .footer-links {
        flex-wrap: wrap;
        justify-content: center;
      }
    }

    
  </style>
  