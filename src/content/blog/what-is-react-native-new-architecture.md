---
title: "What Is React Native’s New Architecture?"
summary: "A look at React Native’s New Architecture and the history behind it."
date: September, 09 2025
draft: false
tags:
  - React Native
  - Architecture
---

If you’re a React Native developer, you’ve probably heard a lot about the **New Architecture**. But what exactly is it? And if there’s a _new_ architecture, that must mean there was an _old_ one, right?

To understand what the New Architecture is, let's take a trip down memory lane and see how we got here.

## A Timeline

The story of React Native's architectural evolution spans nearly a decade.

#### 2018

The React Native team announces that it's working on a [large-scale rearchitecture of React Native](https://reactnative.dev/blog/2018/06/14/state-of-react-native-2018#architecture).

#### 2022

React Native 0.68 is released allowing developers to [opt into the New Architecture](https://reactnative.dev/blog/2022/03/30/version-068#opting-in-to-the-new-architecture).

#### 2024

React Native 0.76 is released, making the [New Architecture the default choice](https://reactnative.dev/blog/2024/10/23/release-0.76-new-architecture) for all new projects.

#### 2025

The React Native team announces that it's [freezing the Legacy Architecture](https://github.com/reactwg/react-native-new-architecture/discussions/290).

## Understanding the Legacy Architecture

To appreciate why this change was necessary, we need to understand how React Native originally worked.

The Legacy Architecture was built around a central concept: the bridge. This bridge served as the communication layer between the JavaScript world (where your React components live) and the native world (where platform-specific UI components and functionality reside).

Every time your JavaScript code needed to interact with native functionality, like updating the UI, accessing device features, or responding to user input, it had to serialize the message into JSON and send it across this bridge to the other side. As you can imagine, this approach came with significant performance overhead.

The asynchronous, batched nature of these communications introduced latency that became increasingly problematic as apps grew more complex. Think of it like passing notes to your friends in class in the pre-cellphone era. That's essentially what was happening thousands of times per second in React Native apps.

You can read more about the original architecture in the [React Native team's 2018 retrospective](https://reactnative.dev/blog/2018/06/14/state-of-react-native-2018#architecture).

## Freezing the Legacy Architecture

When the React Native team announced they were freezing the Legacy Architecture, they were making a commitment to focus all of their time and effort on supporting and improving the New Architecture. This freeze meant:

- Stopping development work on the Legacy Architecture
- No longer accepting PRs that modify the Legacy Architecture
- Stopping testing the Legacy Architecture when releasing new versions of React Native

## The New Architecture

Rather than incrementally improving the existing system, the React Native team chose to fundamentally reimagine how the framework operates. The New Architecture addresses the Legacy Architecture's limitations through three major changes that work together to create a more performant and capable platform.

### Goodbye Bridge, Hello JSI

The most significant change is the elimination of the bridge entirely. In its place, React Native now uses the JavaScript Interface (JSI), a C++ API that enables direct, synchronous communication between JavaScript and native code. Instead of serializing messages and waiting for asynchronous responses, your JavaScript code can now call native functions directly, just like calling any other JavaScript function.

This change alone eliminates the serialization overhead and communication latency that existed in the Legacy Architecture. The result is noticeably faster interactions and smoother user experiences, particularly in scenarios involving frequent communication between JavaScript and native code.

### Fabric: A Modern Rendering Engine

The New Architecture introduces Fabric, a rendering system built on top of React Fiber. Where the old architecture handled UI updates asynchronously through the bridge, causing visual lag and inconsistent behavior, Fabric enables synchronous layout calculations and more predictable rendering.

This means an end to the frustrating "jump" effect that users sometimes experienced when content would suddenly shift after loading. Fabric also enables the prioritization of certain user interactions, ensuring that touch responses and critical animations receive the attention they need for smooth performance.

Perhaps most importantly, Fabric unlocks support for advanced concurrent React features like automatic batching, `startTransition`, and Suspense. These capabilities enable more sophisticated data fetching patterns and better user experiences that simply weren't possible with the Legacy Architecture.

### Turbo Native Modules

The third pillar of the New Architecture addresses how React Native handles native modules-the bridge between JavaScript and platform-specific functionality like cameras, GPS, and file systems. In the Legacy Architecture, all native modules were loaded at app startup, regardless of whether they would actually be used. This led to slower startup times and unnecessary memory usage.

Turbo Modules solve this problem by implementing lazy loading. Native modules are now loaded only when your code actually needs them, resulting in faster app startup times and more efficient resource usage. This is particularly beneficial for larger apps that integrate many native modules, as users no longer pay the startup cost for functionality they might never use.

You can explore Turbo Modules in detail in the [official documentation](https://reactnative.dev/docs/turbo-native-modules-introduction).

## Making the Switch

If you're working with an existing React Native project, transitioning to the New Architecture will require some planning. The specific steps depend on which version of React Native you're currently using, but the process typically involves enabling the New Architecture in your project configuration and updating any dependencies that haven't yet added New Architecture support.

For newer projects starting with React Native 0.76 or later, the New Architecture is already enabled by default, making the transition seamless for new developments.

The upgrade process will likely require updating some of your dependencies, as not all third-party packages immediately supported the New Architecture when it was first introduced. However, the ecosystem has been steadily catching up, and most popular packages now offer New Architecture compatibility.

## Migration Success Story: Shopify

Shopify, one of the largest React Native adopters, has documented their migration journey in detail. Their [engineering blog post](https://shopify.engineering/react-native-new-architecture) offers valuable insights into the practical challenges and benefits of adopting the New Architecture in a production environment.
