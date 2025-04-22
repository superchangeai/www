<template>
    <div class="flex flex-col min-h-screen bg-background text-foreground">
    <header class="py-6 border-b border-border">
      <div class="container mx-auto px-8 flex justify-between items-center">
            <router-link :to="'/'" class="flex items-center gap-2">
              <img src="/super.svg" alt="Superchange.ai logo" class="h-6" />
            <span class="font-semibold">superchange.ai</span>
            <Badge variant="outline" class="hidden md:block">beta</Badge>
          </router-link>
        <nav class="flex gap-4 items-center">
          <!-- Desktop Navigation -->
          <div class="hidden md:hidden lg:flex gap-6 items-center">
            <a href="/#features" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">AI classification</a>
            <a href="/#alerts" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Smart alerts</a>
            <a href="/#custom" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Custom changelog</a>
            <a href="/#roadmap" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200">Roadmap</a>
            <a href="https://github.com/superchangeai" class="hidden md:flex text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 flex gap-2 items-center">
                            <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path :d="siGithub.path" /></svg>
                        </a>
            <router-link :to="'/feed/'">
              <Button size="lg">
                Browse the changes
              </Button>
            </router-link>
          </div>
          
          <!-- Mobile Navigation -->
          <div class="lg:hidden flex items-center gap-4">
            <Button @click="isMobileMenuOpen = true" variant="ghost" size="icon">
              <Menu class="h-6 w-6" />
            </Button>
            <router-link :to="'/feed/'">
              <Button size="lg">
                Browse
              </Button>
            </router-link>
          </div>
        </nav>
        
        <!-- Mobile Menu Sheet -->
        <Sheet v-model:open="isMobileMenuOpen">
          <SheetContent side="top" class="w-full sm:w-full">
            <SheetHeader>
              <SheetTitle><img src="/super.svg" alt="Superchange.ai logo" class="h-6" /></SheetTitle>
            </SheetHeader>
            <div class="flex flex-col gap-4 py-4">
              <a href="#features" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200" @click.prevent="scrollToSection('#features')">AI classification</a>
              <a href="#alerts" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200" @click.prevent="scrollToSection('#alerts')">Smart alerts</a>
              <a href="#custom" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200" @click.prevent="scrollToSection('#custom')">Custom changelog</a>
              <a href="#roadmap" class="text-muted-foreground text-sm hover:text-foreground transition-colors duration-200" @click.prevent="scrollToSection('#roadmap')">Roadmap</a>
              <a href="https://github.com/superchangeai" class="md:flex text-muted-foreground text-sm hover:text-foreground transition-colors duration-200 flex gap-2 items-center" @click="isMobileMenuOpen = false">
                            <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path :d="siGithub.path" /></svg> Github
                        </a>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>

    <main>
      <router-view></router-view>
      
      
    </main>

    <footer>
      <Footer />
    </footer>

  </div>
  </template>
  
  <script setup>
    import { Button } from '@/components/ui/button'
    import { Badge } from '@/components/ui/badge'
    import Footer from '@/components/Footer.vue'
    import {
      Menu,
    } from 'lucide-vue-next'
    import { siGithub } from 'simple-icons';
    import { RouterLink } from 'vue-router'
    import {
      Sheet,
      SheetContent,
      SheetHeader,
      SheetTitle
    } from '@/components/ui/sheet'
    import { ref } from 'vue'
    const isMobileMenuOpen = ref(false)


    const scrollToSection = (sectionId) => {
      isMobileMenuOpen.value = false
      setTimeout(() => {
        requestAnimationFrame(() => {
          const element = document.querySelector(sectionId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        })
      }, 300)
    }
</script>
  
  <style>
  * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: hsl(var(--background));
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

    .hero p {
      font-size: 1.2rem;
      color: hsl(var(--muted-foreground));
      max-width: 800px;
      margin: 1em auto;
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
        hsl(var(--primary) / 0.2),
        hsl(var(--primary) / 0.5),
        hsl(var(--primary) / 0.2),
        transparent
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      box-shadow: 0 0 15px hsl(var(--primary) / 0.3);
    }

    .cta-section h2 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
    }

    .cta-section p {
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

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .testimonials-card {
      background-color: hsl(var(--card));
      border-radius: 0.5rem;
      padding: 2rem;
      border: 1px solid hsl(var(--border));
    }

    .testimonials-description {
      font-size: 0.95rem;
    }

    .testimonials-author {
      color: hsl(var(--muted-foreground));
      font-size: 0.875rem;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .coming-soon-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }

    .coming-soon-item .checkbox {
      width: 1.5rem;
      height: 1.5rem;
      border: 2px solid hsl(var(--border));
      border-radius: 0.25rem;
      position: relative;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }

    .coming-soon-item.checked .checkbox::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 0.75rem;
      height: 0.75rem;
      background-color: hsl(var(--primary));
      border-radius: 0.125rem;
    }

    .coming-soon-item.checked {
      background-color: hsl(var(--card));
      border: 1px solid hsl(var(--border));
    }

    .coming-soon-item .content {
      flex: 1;
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
      .section-heading {
        font-size: 2em;
      }
    
    }

    
  </style>
  