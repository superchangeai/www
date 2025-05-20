---
title: "Frequently Asked Questions"
description: "Answers to common questions about Superchange.ai"
date: "2023-05-16"
author: "Superchange.ai"
---

## General questions

### What is Superchange.ai?

Superchange.ai is an open source AI agent tasked to aggregate changelogs from various tech providers into one central feed. It helps you stay updated on the latest changes and updates from the tools and services you depend on.

### Is Superchange.ai free to use?

Yes, Superchange.ai is free to use for all users. It may change one day, in the event costs of operations are rising, but we're committed to making it as accessible as possible.

## Using Superchange.ai

### What providers do you track?

We track changelogs from countless tech providers across various categories including cloud services, developer tools, SaaS platforms, and more. You can browse the full list in the [Providers section here](https://www.superchange.ai/providers/all).

### How often is the changelog data updated?

Our system monitors provider changelogs every night, and updates our database as new changes are detected.

### Can I suggest new providers to be added?

New providers are added based on your requests – if your stack relies on it, we'll likely support it. If you have a provider that you'd like to see added, please [use the form on this page](https://www.superchange.ai/providers/all).

### How do I become a member?

You can sign up using your GitHub account or email address. Visit our [How to become a member](/docs/how-to/become-a-member) guide for detailed instructions.

### Can I get notified about specific changes?

Yes, as a member you can set up custom alerts based on providers and change types. These alerts can be delivered via email. Check our [How to set up an alert](/docs/how-to/set-up-an-alert) guide for more information.

### Can I create my own custom changelog?

Yes, members can create custom changelogs that include only the providers they care about. This allows you to have a personalized view of changes relevant to your tech stack. See our [How to create a custom changelog](/docs/how-to/create-a-custom-changelog) guide.

## Technical Questions

### Do you have an API?

Yes, we offer a RESTful API that allows developers to integrate our changelog data into their own applications. Check our [API Reference](/docs/api-reference) for detailed documentation.

### How is this content gathered?

Scrapers run nightly on Github actions. They crawl the given changelog pages and archive the relevant information. This is MIT-licensed and open source, [have a look here](https://github.com/superchangeai/daily-snapshot).

### How does the AI classification work?

An LLM is tasked to review the diff and categorize updates by type (feature, bugfix, etc.), as well as generating concise summaries. This makes it easier to understand the impact and relevance of each change. This system is MIT-licensed and open source, [have a look here](https://github.com/superchangeai/daily-change).

## Account Management

### How do I change my email address or password?

You can update your name, email and password in the [Settings section](https://www.superchange.ai/settings/profile) of your profile.

### How do I delete my account?

To delete your account, please go to your [Settings](https://www.superchange.ai/settings/profile) and use the "Delete Account" option marked in red. This will permanently delete your account and remove your data from our servers.

### I forgot my password. How do I reset it?

On the login page, click the "[Forgot your password?](https://www.superchange.ai/forgot-password)" link and follow the instructions to reset your password.