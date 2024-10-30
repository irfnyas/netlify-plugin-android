Netlify Build plugin android - adding support to build [Flutter](https://flutter.dev) inside Netlify.

Currently supported: `Android`, `Web`

# Install

Please install this plugin from the Netlify app.

1. Add the following to `netlify.toml`:
```yaml
[[plugins]]
  package = "/plugins/netlify-plugin-android"
[build]
  command = "flutter build apk && flutter build web"
  publish = "build/web"
```

2. Add the following package files to `plugins/netlify-plugin-android`:
```
plugin/netlify-plugin-android
  |__ src
  |   |__ index.js
  |__ manifest.yml
  |__ package.json
```

3. Add the following to `app/build.gradle` for building APK (optional):
```js
android.applicationVariants.all { variant ->
    variant.assemble.doLast {
        def outputFile = variant.outputs.first().outputFile
        copy {
            from outputFile.parent
            into file("${rootDir.parent}/build/web")
            include outputFile.name
        }
    }
}
```