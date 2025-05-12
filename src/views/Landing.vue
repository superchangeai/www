<template>
    <section class="relative bg-gradient-to-br from-[#0d0d0e] via-[#151b26] to-[#1a2540] bg-blend-overlay min-h-[450px] flex flex-col justify-center" ref="heroSection">
        <div class="container mx-auto px-8 flex gap-2 items-center justify-between">
        <div class="w-full text-center lg:w-[75%] lg:text-left">
                <h1 class="text-5xl md:text-6xl font-semibold mb-6 leading-tight" style="color:#d4d4d4;">The changelog of changelogs.</h1>
                <p class="py-2 text-center md:text-center lg:text-left text-md text-muted-foreground max-w-3xl mb-8">Superchange is your source of truth for everything you build on. <span class="hidden lg:block">You will never miss a breaking change again!</span></p>
                <div class="flex gap-4 mt-4 items-center justify-center lg:justify-start">
                  <router-link :to="'/feed/'">
                    <Button size="xxl" aria-label="Browse the changes">
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
        <img src="/superchange.webp" alt="Superchange.ai homepage" class="hidden md:hidden lg:block" width="400" />
        </div>
    </section>

      <section id="features" class="feature-section">
        <h2 class="section-heading px-3">
          One single changelog to stay on top of your providers          
        </h2>

        <div class="changelog-demo block md:hidden">
            <img src="/ui-changes-feed.webp" alt="Superchange.ai dashboard showing unified changelog" />
        </div>
        <div class="container">
          <div class="changelog-demo hidden md:block">
            <img src="/ui-changes-feed.webp" alt="Superchange.ai dashboard showing unified changelog" />
          </div>
          <p class="section-description">API specs, AI models lifecycle, devtools release notes – important updates are scattered everywhere. <br> Critical changes often get buried in documentation, and must-do migrations go unnoticed until it's too late.</p>
          <div class="features-grid">
            <div class="feature-card flex flex-col items-center text-center">
              <img src="/central.png" width="60" class="mb-4" alt="Central feed">
              <h3 class="feature-title">Centralized updates</h3>
              <p class="text-muted-foreground">Superchange.ai aggregates changelogs from countless providers into a single feed, refreshed daily.</p>
            </div>
            <div class="feature-card flex flex-col items-center text-center">
              <img src="/ai.png" width="60" class="mb-4" alt="AI classification">
              <h3 class="feature-title">Automatic classification</h3>
              <p class="text-muted-foreground">Your central changelog is using AI to tag each update (e.g security patch, breaking change, minor fix, etc.) and provide a concise summary for quick scanning.</p>
            </div>
            <div class="feature-card flex flex-col items-center text-center">
              <img src="/transparency.png" width="60" class="mb-4" alt="Detailed source">
              <h3 class="feature-title">Full transparency</h3>
              <p class="text-muted-foreground">Every entry links back to the official source. You can always get details in the original notes or docs.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="alerts" class="feature-section">
        <h2 class="section-heading px-3">Updates that actually update you</h2>
        <div class="alert-demo block md:hidden">
          <img src="/ui-alert-action.webp" alt="Creating a custom alert in Superchange.ai" />
        </div>
        <div class="container">
          <p class="section-description hidden md:block">There's a fine line between missing crucial updates and getting drowned in noise. <br> Superchange.ai lets you control that balance with smart, filtered alerts.</p>
          
          <div class="alert-demo hidden md:block">
            <img src="/ui-alert-action.webp" alt="Creating a custom alert in Superchange.ai" />
          </div>
          
          <div class="features-grid">
            <div class="feature-card flex flex-col items-center text-center">
              <img src="/bot.png" width="65" class="mb-4" alt="Your providers">
              <h3 class="feature-title flex items-center gap-2"><Badge variant="outline">1</Badge> Your providers</h3>
              <p class="feature-description">Select the services, APIs, libraries, or platforms you care about. We curate what we use and love – you too can <br>contribute with providers you need.</p>
            </div>
            <div class="feature-card flex flex-col items-center text-center">
              <img src="/alert.png" width="60" class="mb-4" alt="Your alerts">
              <h3 class="feature-title flex items-center gap-2"><Badge variant="outline">2</Badge> Your priorities</h3>
              <p class="feature-description">Choose the types of updates you want to know about – security fixes, breaking changes, performance improvements, new features – and skip the rest.</p>
            </div>
            <div class="feature-card flex flex-col items-center text-center">
              <img src="/schedule.png" width="60" class="mb-4" alt="Your schedule">
              <h3 class="feature-title flex items-center gap-2"><Badge variant="outline">3</Badge> Your schedule</h3>
              <p class="feature-description">Decide how and when updates get delivered. Get instant notifications in Slack, a daily email digest, a weekly summary, or even route updates to a custom webhook.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="custom" class="feature-section">
        <h2 class="section-heading px-3">The ultimate source of truth based on your exact needs.</h2>
        <div class="alert-demo block md:hidden">
          <img src="/ui-changelog-create.webp" alt="Creating a custom changelog in Superchange.ai" />
        </div>
        <div class="container">
          <p class="section-description hidden md:block">Watch the providers you really care about. <br> Superchange.ai lets you create and share dedicated changelogs for your projects.</p>
          
          <div class="alert-demo hidden md:block">
            <img src="/ui-changelog-create.webp" alt="Creating a custom changelog in Superchange.ai" />
          </div>
          
          <p class="section-description">Sounds good? Hear what our users say:</p>

          <div class="testimonials-grid">
            <div class="testimonials-card flex flex-col items-left text-left">
              <p class="testimonials-description">"We are looking at Superchange in our weekly sessions to see if there are any changes we need to watch out for."</p>
              <p class="testimonials-author">Alex, Product at Kawo</p>
            </div>
            <div class="testimonials-card flex flex-col items-left text-left">
              <p class="testimonials-description">"There were so many times when a random update threw us into a panic. Won't happen again."</p>
              <p class="testimonials-author">Edward, VP engineering at Le Wagon</p>
            </div>
            <div class="testimonials-card flex flex-col items-left text-left">
              <p class="testimonials-description">"No need to go through my RSS feeds one by one anymore, I use Superchange to get a small condensed summary."</p>
              <p class="testimonials-author">Antoine, Lead architect at Scaleway</p>
            </div>
          </div>
          
        </div>
      </section>

      <section id="roadmap" class="feature-section">
        <div class="container">
          <h2 class="section-heading">Moar to come</h2>
          <p class="section-description">Superchange.ai's roadmap is packed with developer-friendly enhancements:</p>
          
          <div class="coming-soon">
            <div class="coming-soon-item checked">
              <div class="checkbox"></div>
              <div class="content">
                <div class="coming-soon-title text-left">
                  <span>Agentic AI-ready with <a href="https://api.superchange.ai/v1/llms.txt">LLMs.txt</a></span>
                  <Badge>live</Badge>
                </div>
                <p class="coming-soon-description text-left">Your coding assistants and AI-native IDEs can directly consume Superchange.ai through our <a href="https://api.superchange.ai/v1/llms.txt">LLMs.txt</a></p>
              </div>
            </div>
            <div class="coming-soon-item checked">
              <div class="checkbox"></div>
              <div class="content">
                <div class="coming-soon-title text-left">
                  <span>Community-driven expansion</span>
                  <Badge>ongoing</Badge>
                </div>
                <p class="coming-soon-description text-left">New providers are added based on your requests – if your stack relies on it, we'll likely support it.</p>
              </div>
            </div>
            <div class="coming-soon-item opacity-80">
              <div class="checkbox"></div>
              <div class="content">
                <div class="coming-soon-title text-left">
                  <span>Github integration</span>
                  <Badge variant="outline">coming soon</Badge>
                </div>
                <p class="coming-soon-description text-left">GitHub Actions support in the works, automating update checks directly in your repositories.</p>
              </div>
            </div>
            <div class="coming-soon-item opacity-50">
              <div class="checkbox"></div>
              <div class="content">
                <div class="coming-soon-title text-left">
                  <span>MCP compatibility</span>
                  <Badge variant="outline">coming later</Badge>
                </div>
                <p class="coming-soon-description text-left">Integration with Model Context Protocol (MCP) allowing AI agents to query your unified changelog directly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="cta-section relative bg-background">
        <div class="container z-10 relative flex flex-col items-center">
          <h2>Boring stuff, done better</h2>
          <p class="text-md">Superchange.ai was vibe coded by a technical product manager who spent a decade building APIs and developer platforms — and constantly struggled to keep up with others' changelogs. It's built to be transparent and reliable from day one.</p>
          <div class="buttons z-10 relative">
            <router-link to="/feed">
            <Button size="xxl" aria-label="Join Superchange beta">Join the Public Beta</Button>
            </router-link>
          </div>
        </div>
        <div class="absolute inset-0 z-0 bg-curves"></div>
    </section>
</template>
<script setup>
    import { Button } from '@/components/ui/button'
    import { Badge } from '@/components/ui/badge'
</script>