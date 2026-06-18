---
title: "Implementing tap on active tab to scroll to top in Expo Router"
summary: "How to implement scroll-to-top when tapping the active tab in Expo Router, for ScrollView and FlatList."
date: "June 17 2026"
draft: false
tags:
  - React Native
  - Expo
  - Expo Router
  - React Navigation
---

If you've ever tapped the Home tab in Instagram or X while already on that screen, you've seen scroll-to-top in action. The list jumps back to the top of the screen. This behavior is common and something users have come to expect from any app with a bottom tab bar and scrollable content. In Expo Router, it's fairly easy to implement and how you do it depends on which tab layout you use:

- **JavaScript tabs** ([Expo docs](https://docs.expo.dev/router/advanced/tabs/)): `Tabs` from `expo-router`, backed by React Navigation's bottom tab navigator. Attach `useScrollToTop` to your scrollable ref.
- **Native tabs** ([Expo docs](https://docs.expo.dev/router/advanced/native-tabs/)): `NativeTabs`, SDK 55+. Scroll-to-top is built in on iOS (and Android SDK 55+); you usually do not need the hook.

This post focuses on JavaScript tabs and `useScrollToTop`, with some notes on native tabs at the end.

## How it works

When a user taps a tab, the tab navigator emits a [`tabPress`](https://reactnavigation.org/docs/bottom-tab-navigator#tabpress) event. If the tab was not already focused, the navigator switches to it. If the tab is already focused, the default behavior depends on the screen: a nested stack is reset with `popToTop`, and a scrollable root screen can be scrolled to top with `useScrollToTop`.

The [`useScrollToTop`](https://reactnavigation.org/docs/use-scroll-to-top) hook from `@react-navigation/native` listens for `tabPress` on parent tab navigators and scrolls only when the screen is **focused** and on the **first route** of any nested stack.

## ScrollView example

The pattern is the same for every screen: create a ref, pass it to the hook, and attach it to your scrollable component.

```tsx
import { useRef } from "react";
import { ScrollView, Text } from "react-native";
import { useScrollToTop } from "@react-navigation/native";

export default function HomeScreen() {
  const scrollRef = useRef<ScrollView>(null);

  useScrollToTop(scrollRef);

  return (
    <ScrollView ref={scrollRef}>
      <Text>Your content here</Text>
    </ScrollView>
  );
}
```

Place this in a file under your tabs layout — for example `app/(tabs)/index.tsx` — and tapping the active tab will scroll the `ScrollView` to `y: 0`.

## FlatList example

`FlatList` works the same way. Under the hood, `useScrollToTop` calls `getScrollResponder()` on list wrappers like `FlatList` and `SectionList`, so you pass the list ref directly.

```tsx
import { useRef } from "react";
import { FlatList, Text } from "react-native";
import { useScrollToTop } from "@react-navigation/native";

const DATA = Array.from({ length: 50 }, (_, i) => ({
  id: String(i),
  title: `Item ${i + 1}`,
}));

export default function ListScreen() {
  const listRef = useRef<FlatList>(null);

  useScrollToTop(listRef);

  return (
    <FlatList
      ref={listRef}
      data={DATA}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
}
```

`SectionList` follows the same pattern if your screen uses grouped data.

## Custom scroll behavior

Sometimes scrolling to absolute zero isn't what you want. Maybe you have a sticky header, or you want to scroll to a specific offset instead of the very top.

`useScrollToTop` accepts a ref to an object with a `scrollToTop` method, which gives you full control:

```tsx
import { useRef } from "react";
import { ScrollView } from "react-native";
import { useScrollToTop } from "@react-navigation/native";

export default function HomeScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const scrollToTopRef = useRef({
    scrollToTop: () => {
      scrollRef.current?.scrollTo({ y: 100, animated: true });
    },
  });

  useScrollToTop(scrollToTopRef);

  return <ScrollView ref={scrollRef}>{/* content */}</ScrollView>;
}
```

## Manual implementation

If you need logic that goes beyond scrolling — refreshing data on tab press, tracking analytics, or coordinating multiple scroll views — you can listen for the event yourself with [`navigation.addListener`](https://reactnavigation.org/docs/navigation-events#listening-to-events).

```tsx
import { useEffect, useRef } from "react";
import { FlatList, Text } from "react-native";
import { useNavigation } from "expo-router";

const DATA = Array.from({ length: 50 }, (_, i) => ({
  id: String(i),
  title: `Item ${i + 1}`,
}));

export default function ListScreen() {
  const navigation = useNavigation();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", (e) => {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <FlatList
      ref={listRef}
      data={DATA}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <Text>{item.title}</Text>}
    />
  );
}
```

One difference from `useScrollToTop`: `tabPress` fires on every press of **this** tab's button, including when switching _to_ it from another tab. The built-in hook only scrolls when the screen is already focused and on the root route of a nested stack. To approximate that in a manual listener, call `navigation.isFocused()` at event time and skip when `e.defaultPrevented`:

```tsx
useEffect(() => {
  const unsubscribe = navigation.addListener("tabPress", (e) => {
    if (!navigation.isFocused() || e.defaultPrevented) return;

    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  });

  return unsubscribe;
}, [navigation]);
```

If the screen lives inside a **stack nested under tabs** (common in Expo Router), `tabPress` is emitted by the tab navigator, not the stack. Attach the listener to the parent tab navigator with `navigation.getParent()`, or prefer `useScrollToTop`, which registers on parent tab navigators and handles the root-route check for you.

For most apps, `useScrollToTop` is the better default. Reach for the manual approach only when you need side effects alongside the scroll.

## Extracting a reusable hook

If several tab screens share the same scrollable setup, a thin wrapper keeps things consistent:

```tsx
import { useRef } from "react";
import type { FlatList, ScrollView, SectionList } from "react-native";
import { useScrollToTop } from "@react-navigation/native";

type Scrollable = ScrollView | FlatList<any> | SectionList<any, any>;

export function useTabScrollToTop<T extends Scrollable>() {
  const ref = useRef<T>(null);
  useScrollToTop(ref);
  return ref;
}
```

Then in any tab screen:

```tsx
export default function HomeScreen() {
  const scrollRef = useTabScrollToTop<ScrollView>();

  return <ScrollView ref={scrollRef}>{/* content */}</ScrollView>;
}
```

## Troubleshooting

### "Couldn't find a navigation object"

This error means `useScrollToTop` (or `useNavigation`) is being called outside of a screen in the navigation tree. Common causes:

- The hook is used in a component rendered outside the tab navigator — for example, a modal or a provider that wraps the entire app.
- `@react-navigation/native` is on an incompatible version. Make sure it matches what your Expo SDK expects:

```bash
npx expo install @react-navigation/native
```

The component calling the hook must be rendered as a screen (or inside one) within your `(tabs)` layout.

### Scroll doesn't happen on tab press

- Make sure the ref is attached to the scrollable component, not a wrapper `View`.
- If the tab screen is inside a nested stack, `useScrollToTop` only scrolls on the **root** screen of that stack. On a detail screen, tab press pops the stack first.
- If you're using `Animated.createAnimatedComponent(ScrollView)`, the ref may need to point at the inner scroll node. `useScrollToTop` calls `getNode()` on animated wrappers when needed, but a manual ref to the animated wrapper can still break the connection.
- Nested scroll views only scroll the one you attach the ref to. If content is inside a nested `ScrollView`, attach the ref to the outermost scrollable that should respond to the tab press.

### Native tabs (Expo SDK 55+)

`NativeTabs` uses the platform tab bar. Scroll-to-top is enabled by default when tapping an active tab on its root screen. Set `disableScrollToTop` on `NativeTabs.Trigger` to turn it off.

On the native-tabs path, **remove `useScrollToTop`**. Both the native handler and the React Navigation hook can respond to the same tap, which causes races or double-scrolls.

Native tabs also differ from JavaScript tabs in a few ways worth noting:

- The `ScrollView` should be the **first child** of the screen. If you wrap it, set `collapsable={false}` on the wrapper ([troubleshooting guide](https://docs.expo.dev/router/advanced/native-tabs/#scroll-to-top-does-not-work-when)).
- **`FlatList` has limited native-tabs support** — scroll-to-top and minimize-on-scroll may not work. Prefer `ScrollView`, or keep JavaScript tabs if you rely on `FlatList` tab-scroll behavior ([known limitations](https://docs.expo.dev/router/advanced/native-tabs/#limited-support-for-flatlist)).

## Testing

If you unit test screens that call `useScrollToTop`, wrap them in a navigation container or mock the hook:

```tsx
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useScrollToTop: jest.fn(),
  };
});
```

For integration tests with React Native Testing Library, render the screen inside a test navigator so the navigation context is available.

## Summary

| Component     | Ref type              | Hook / method                        |
| :------------ | :-------------------- | :----------------------------------- |
| `ScrollView`  | `useRef<ScrollView>`  | `useScrollToTop(ref)`                |
| `FlatList`    | `useRef<FlatList>`    | `useScrollToTop(ref)`                |
| `SectionList` | `useRef<SectionList>` | `useScrollToTop(ref)`                |
| Custom logic  | Any                   | `navigation.addListener("tabPress")` |

For Expo apps using JavaScript tabs, adding tap-to-scroll-top is usually a three-line change: import the hook, create a ref, attach it. Users get the familiar native behavior without reimplementing tab-press detection yourself.
