---
title: "Breaking Free from Tribal Knowledge Trap with Architecture Decision Records"
summary: ""
date: May 6, 2025
draft: false
tags:
  - Architecture
---

Software development is a constant series of decisions. From choosing languages, frameworks, and tools to defining database structures, every project is shaped by countless choices, big and small.

The challenge? Most of us don’t have the luxury of joining a project from day one. More often, we inherit codebases years—or even decades—after their inception. By then, the original architects and key decision makers have likely moved on, and the rationale behind critical decisions is rarely documented in a clear, accessible way.

It ends up feeling like a game of telephone: what began as a well-reasoned decision gets passed along informally, misinterpreted, and reshaped over time. Each developer adds their own assumptions or misunderstandings until the original intent is barely recognizable. Without a written record to preserve the why behind decisions, valuable context gets lost in translation.

This is where Architecture Decision Records come in, bridging the gap between past decisions and present understanding.

## What Are Architecture Decision Records?

ADRs are a lightweight documentation technique designed to capture important architectural decisions and their context. Think of them as a living historical record of why certain technical choices were made.

Unlike tedious, overly formal documentation, ADRs focus on being concise and actionable. They provide just enough context for future readers—whether they’re developers, managers, or new hires—to understand the reasoning behind a decision.

## What Problems Do ADRs Solve?

Without ADRs, teams often rely on tribal knowledge, information locked in people’s memories or scattered across informal channels. This creates several problems such as:

- Forgotten rationales for critical technical choices. Why did we choose this framework or tool?
- Knowledge that exists only in select team members' memories, and memories aren't always reliable.
- Lost context surrounding past architectural decisions. What constraints influenced our decisions at the time?

ADRs solve these problems by providing transparency and institutional memory, ensuring that every significant architectural decision is documented and accessible to anyone in the organization.

## When Should You Create an ADR?

Not every decision warrants an ADR. Here are some guidelines on what to document.

### Good Candidates for ADRs:

These are decisions that shape the foundation or direction of your system, especially those with long-term implications:

- **Significant Architectural Choices or Changes**:E.g. Transitioning from a monolithic architecture to a microservices-based approach.

- **Tech Stack Selection**: E.g. Deciding between Angular, React, or Vue.js for a front-end framework in a new project.

- **Choices With Long-Term Impact on System Design**: E.g. Establishing REST APIs vs. GraphQL for service communication.

- **Major Database Schema Changes**: E.g. Migrating from a relational database to NoSQL for scalability.

- **Decisions Involving Trade-Offs Between Multiple Approaches**: E.g. Choosing between a custom-built caching solution or using Redis for performance optimization.

- **Selecting Third-Party Services or Frameworks**: E.g. Evaluating AWS Lambda vs. Google Cloud Functions for a serverless backend.

- **Adopting Standards or Practices That Affect Team Workflow**: E.g. Introducing feature toggles as a standard for managing incomplete features.

### Decisions That Don’t Need an ADR

Avoid creating ADRs for minor or low-impact decisions. Some examples of that include:

- **Minor Implementation Details**: E.g. Deciding on specific file naming conventions or directory structures.

- **Configuration Changes**: E.g. Updating environment variables or tweaking application settings for deployment.

- **Small-Scale Library or Utility Choices**: E.g. Picking between two npm packages for date formatting, such as `date-fns` vs. `moment`.

By focusing ADRs on decisions with far-reaching consequences, you create a repository that’s not only easier to maintain but also highly valuable for your team’s future decision-making.

## Key Components of an Effective ADR

A well-written ADR typically includes the following:

- **Decision Title and Status**: Clearly name the decision and mark it as proposed, approved, or deprecated.
- **Context and Problem Statement**: Explain the problem the decision aims to solve and the context in which it arose.
- **Considered Alternatives**: List the options that were evaluated.
- **Chosen Solution and Rationale**: Describe the decision and why it was chosen over others.
- **Consequences**: Discuss the potential impact, including trade-offs and risks.
- **Future Implications**: Note any possible follow-ups or conditions under which the decision might be revisited.

## Benefits for Different Team Roles

ADRs aren't just for developers, they offer value across the board:

- **For Developers**: Provides a clear understanding of why things are built a certain way, avoiding endless debates.
- **For New Team Members**: Offers quick onboarding and historical context.
- **For Managers**: Enables tracking of decision-making processes and reasoning.
- **For Long-Term Maintenance**: Creates a comprehensive technical narrative and simplifies troubleshooting and evolution of systems over time.

## Where should ADRs be stored?

ADRs can be stored anywhere, but they should be easy to find and accessible and as close to the code as possible. This ensures that they are part of the team's daily workflow and are updated as the system evolves. A common best practice is to store ADRs in the same repository as the code they pertain to, often in a `docs/architecture` directory.

By keeping ADRs in the same repository, they benefit from the same versioning and collaboration features as the code. This also allows developers working on the code to easily reference ADRs without needing to switch tools or platforms.

## Tools for Managing ADRs

One of the most popular tools for creating and maintaining ADRs is [ADR-Tools](https://github.com/npryce/adr-tools). It simplifies the process by providing templates and organizing decisions into a structured format.

### Initializing ADR directory

The default directory where ADRs are stored is `doc/adr`, but you can specify the directory when you initialise the ADR log. To create an ADR directory in the root of your project, run:

`adr init doc/architecture/decisions`

The directory can be changed to match your project structure.

### Creating an ADR

To create an ADR, use the following command:

`adr new {title}`

Replace `{title}` with the name of the decision you’re documenting. For example: `adr new Record architecture decisions`.

The above example will create a new file named `001-record-architecture-decisions.md` in the directory you initialized to store your decision records. The numbering is automatically incremented based on the existing ADRs in the directory, ensuring a clear, chronological order.

The contents of the file will match the template below:

```md
# 1. Record architecture decisions

Date: 2024-12-01

## Status

Accepted

## Context

We need to record the architectural decisions made on this project.

## Decision

We will use Architecture Decision Records, as [described by Michael Nygard](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions).

## Consequences

See Michael Nygard's article, linked above. For a lightweight ADR toolset, see Nat Pryce's [adr-tools](https://github.com/npryce/adr-tools).
```

## What if decisions change?

Architectural decisions are not set in stone. As projects evolve, new information, technologies, or requirements may make it necessary to revise or replace previous decisions.

If you need to create a new ADR that supersedes a previous one (e.g., ADR 9), you can use the -s option when creating the new record:

`adr new -s 9 Use Zustand for state management`

This command does two things:

1. Creates a new ADR file documenting the updated decision.
2. Updates the status of the superseded ADR: The status of ADR 9 is automatically changed to indicate that it has been superseded by the new ADR.

This ensures that your ADRs maintain a clear and traceable history, showing how decisions evolved over time.

## Best Practices

Like any new process being adopted, there can be a lot of questions, but here are a few guidelines and best practices to get you started:

- **Know What to Document**: Focus on decisions that impact architecture, scalability, or team workflows.
- **Keep ADRs Lightweight**: Avoid overwhelming details—keep it concise and relevant.
- **Leverage AI Tools**: Use AI to suggest alternatives or draft sections based on input, speeding up the documentation process.

Architecture Decision Records are more than just documentation – they're a cultural shift towards transparency, knowledge sharing, and collective understanding. By systematically capturing the "why" behind our technical choices, we create a more collaborative, efficient, and empowered development environment.

Further Reading

- [Architecture Decision Records](https://adr.github.io/)
- [Joel Parker Henderson's Architecture Decision Record](https://github.com/joelparkerhenderson/architecture-decision-record)
