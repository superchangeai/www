# Superchange.ai

[Superchange.ai](https://superchange.ai/) is an open-source service that collects, classifies, and centralizes changelogs and updates from tech providers, giving developers one central feed of everything that's new.

## Overview

[Superchange.ai](https://superchange.ai/) solves a common developer problem: keeping track of changes across multiple services, APIs, and libraries. Instead of monitoring dozens of separate changelogs, release notes, and documentation pages, Superchange.ai aggregates them into a single, searchable feed.

### Key Features

- **Centralized updates**: Aggregates changelogs from numerous providers into a single feed that's refreshed daily
- **Automatic classification**: Uses AI to tag each update (security patch, breaking change, performance improvement, etc.) and provide concise summaries
- **Custom alerts**: Subscribe to specific providers and update types, with notifications via email, Slack next, or webhook later
- **Full transparency**: Every entry links back to the official source for verification

## Project Structure

[Superchange.ai](https://superchange.ai/) consists of several components:

- **Frontend (app)**: Vue.js application for the user interface
- **Backend**: Node.js API for managing sources, snapshots, and user preferences
- **[Daily Snapshot](https://github.com/superchangeai/daily-snapshot)**: Service that captures content from specified web pages (changelogs, release notes, openAPI yml)
- **[Daily Change](https://github.com/superchangeai/daily-change)**: Service that computes differences between snapshots and classifies changes

## Tech Stack

- **Frontend**: Vue 3, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Emailing**: Resend
- **AI classification**: Llama 3.3

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm
- Supabase account and project

### Development

Start the development server:

```bash
npm run dev
```

## Usage

Go up to [Superchange.ai](https://superchange.ai/):

1. **Browse the Feed**: View all aggregated changes or filter by provider
2. **Set Up Alerts**: Configure notifications for specific providers and update types
3. **Integrate via API**: Use the open API to incorporate changelog data into your tools or workflows

## Contributing

Contributions are welcome! Superchange.ai is community-driven and open-source.

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

New providers are added based on community requests - if your stack relies on it, we'll likely support it.

## Roadmap

- ****Project-based feed
- **CI/CD integration**: GitHub Actions support for automated update checks
- **MCP compatibility**: Integration with Model Context Protocol
- **Community-driven expansion**: Adding more providers based on user requests

## License

This project is licensed under Apache-2.0.

---

Superchange.ai was created to solve the real problem of keeping up with fast-moving tech changes. It's designed to be transparent and reliable: fully open-source, with every update traced back to its source.