Netlify Build plugin android - adding support to build [Flutter](https://flutter.dev) in Netlify.
Supported and tested: Android, Web.

# Install

Please install this plugin from the Netlify app.

Add the following to your Netlify site's `netlify.toml` file:

```yaml
[[plugins]]
  package = "/plugins/netlify-plugin-android"
[build]
  command = "flutter build apk"
  publish = "build/artifact"
```
