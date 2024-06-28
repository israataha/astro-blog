---
title: "Fixing jumpy screens in the React Navigation's TabNavigator"
summary: "Troubleshooting guide to fix jumpy behavior when rendering screens"
date: "June 24 2024"
draft: false
tags:
  - React Native
  - React Navigation
  - Troubleshooting
  - iOS
---

While testing a React Native app on iOS recently, I noticed that every time I selected a new tab, the text on the screen would "jump" while rendering. Oddly enough, I wasn't seeing the same behavior on an emulator.

A quick search lead me to this [article](https://echobind.com/post/react-native-fix-jumping-screens-in-the-react-navigation-tabnavigator) which described exactly the behavior I was seeing. Even though it was a few years old and referenced version 1.x of React Navigation, it identified that the issue was related to the usage of SafeAreaView.

So I went back to the [React Navigation](https://reactnavigation.org/) docs and a quick search lead me to the guide on [Supporting safe areas](https://reactnavigation.org/docs/handling-safe-area).

Reading through, this section immediately jumped out at me:
![Snippet](./snippet.png)

> if a screen containing safe area is animating, it causes jumpy behavior.

Bingo! I found the problem, so how do I fix it?

The docs had a few recommendations:

1. avoid using the `SafeAreaView` component
2. always use the `useSafeAreaInsets` hook
3. make sure to wrap your app in [SafeAreaProvider](https://github.com/th3rdwave/react-native-safe-area-context#usage)

So I updated the code by:

- wrapping the `NavigationContainer` in a `SafeAreaProvider`
- replacing `SafeAreaView` with a `View` component
- importing the `useSafeAreaInsets` hook from the `react-native-safe-area-context` library and using to to specify padding on the `View` component

````jsx
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

function Demo() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',

        // Paddings to handle safe area
        // Note that not all padding styles might be needed for your application
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Text>This is top text.</Text>
      <Text>This is bottom text.</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>{/*(...) */}</NavigationContainer>
    </SafeAreaProvider>
  );
}```
````

### Testing

If you're using Jest for testing, make sure to review the section on [Testing](https://github.com/th3rdwave/react-native-safe-area-context?tab=readme-ov-file#testing) and update your Jest setup file to mock the `react-native-safe-area-context`.
