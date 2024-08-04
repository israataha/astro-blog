---
title: "Deploying Apple’s apple-app-site-association file to an Azure Web App Using .NET"
summary: "A guide to supporting iOS Password Autofill with ASP .NET Core backend"
date: "August 5, 2024"
draft: false
tags:
  - Azure
  - Apple
  - iOS
  - .NET
---

If you're developing an iOS app and want to support features like Universal Links or the AutoFill Passwords feature, you need to deploy an `apple-app-site-association` file to your web server. In this article we'll walk through how to deploy this file to an Azure Web App using an ASP .NET Core application.

### Prerequisites

Before you start, make sure you have the following:

- An Azure account with access to an Azure Web App.
- A .NET Core web application.
- Your app's TEAM_ID and APP_BUNDLE to configure the `apple-app-site-association` file.

### 1. Create the `.well-known` directory

The first step is to create a `.well-known` folder in your project's root directory, where your Program.cs file is located. This folder will hold the `apple-app-site-association` file.

### 2. Create the `apple-app-site-association` file

Within the `.well-known` folder, create a file named `apple-app-site-association` without a file extension. This file will contain JSON data that specifies the app's bundle identifiers and Team ID.

Here's a template you can use:

```json
{
  "webcredentials": {
    "apps": ["<TEAM_ID>.<APP_BUNDLE>"]
  }
}
```

<TEAM_ID>: Your Apple Developer Team ID

<APP_BUNDLE>: The bundle identifier of your app e.g. com.example.app

### 3. Modify Program.cs

To ensure your application correctly serves the `apple-app-site-association` file, modify your Program.cs as follows:

Import the necessary namespace:

```csharp
using Microsoft.Extensions.FileProviders;
```

Configure the application to serve static files:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseHttpsRedirection();

// Add this code to allow access to apple-app-site-association file
app.UseStaticFiles(new StaticFileOptions()
{
    FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, @".well-known")),
    RequestPath = new PathString("/.well-known"),
    DefaultContentType = "application/json",
    ServeUnknownFileTypes = true,
});
// end

app.Run();
```

By default, ASP.NET Core applications serve static files from the wwwroot directory. To serve the `apple-app-site-association` file, we configure the StaticFileOptions to include the `.well-known` folder. Because the file does not have an extension, we set `ServeUnknownFileTypes` to `true` and indicate that we want to display the contents of the file as JSON by setting the `DefaultContentType`.

To learn more, refer the Microsoft documentation on [static files in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files?view=aspnetcore-8.0).

### 4. Modify .csproj

Because files and folders that start with a dot (.) are typically hidden, we need to modify the .csproj file to include the `.well-known` folder and its contents. To do so, add the following to your project's .csproj:

```csharp
<ItemGroup>
    <Content Include=".well-known\**" CopyToPublishDirectory="PreserveNewest"/>
</ItemGroup>
```

### 5. Create the deployment package

Use the `dotnet publish` command to package your application for deployment. Inspect the contents of the package to ensure that the `.well-known` directory and its contents are included in the output.

### 6. Deploy to Azure Web App

Deploy the published application to your Azure Web App. You can use various methods to deploy your app to Azure, such as the Azure CLI, Visual Studio, or GitHub Actions.

### 7. Verify the Deployment

Once deployed, verify that the `apple-app-site-association` file is accessible by navigating to https://{your-domain}/.well-known/apple-app-site-association. You should see the JSON contents of your `apple-app-site-association` file.
