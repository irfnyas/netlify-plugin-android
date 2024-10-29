const flutterPath = process.env['HOME'] + '/flutter'
const flutterBinPath = flutterPath + '/bin'
const androidSdkPath = process.env['HOME'] + '/android-sdk'
const javaPath = process.env['HOME'] + '/java'

/* eslint-disable no-unused-vars */
export const onPreBuild = async function ({
  inputs,
  utils: { build, status, cache, run },
}) {
  const targetChannel = inputs.channel || 'stable'

  // Install Java
  console.log('☕️ Installing Java JDK')
  await run('wget', [
    'https://download.oracle.com/java/17/latest/jdk-17_linux-x64_bin.tar.gz',
    '-O',
    'java.tar.gz',
  ])
  await run('mkdir', ['-p', javaPath])
  await run('tar', ['-xzf', 'java.tar.gz', '-C', javaPath, '--strip-components=1'])
  process.env['JAVA_HOME'] = javaPath
  process.env['PATH'] = process.env['PATH'] + ':' + javaPath + '/bin'
  console.log('✅ Java JDK installed')

  // Install Android SDK
  console.log('📱 Downloading Android SDK')
  await run('mkdir', ['-p', androidSdkPath])
  await run('wget', [
    'https://dl.google.com/android/repository/commandlinetools-linux-8092744_latest.zip',
    '-O',
    'cmdline-tools.zip',
  ])
  await run('unzip', ['cmdline-tools.zip', '-d', androidSdkPath])
  await run('mv', [
    `${androidSdkPath}/cmdline-tools`,
    `${androidSdkPath}/cmdline-tools/latest`,
  ])
  process.env['ANDROID_HOME'] = androidSdkPath
  process.env['PATH'] =
    process.env['PATH'] + ':' + androidSdkPath + '/cmdline-tools/latest/bin:' + androidSdkPath + '/platform-tools'
  console.log('✅ Android SDK installed')

  console.log('🔧 Setting up Android SDK packages')
  await run('yes |', [
    `${androidSdkPath}/cmdline-tools/latest/bin/sdkmanager`,
    `"platform-tools"`,
    `"platforms;android-30"`,
    `"build-tools;30.0.3"`,
  ])

  // Install Flutter
  console.log('⚡️ Downloading Flutter Stable SDK')
  await run('git', [
    'clone',
    'https://github.com/flutter/flutter.git',
    '-b',
    targetChannel,
    flutterPath,
  ])
  console.log('✅ Flutter SDK downloaded')

  console.log('🪄 Adding Flutter to PATH')
  process.env['PATH'] = process.env['PATH'] + ':' + flutterBinPath

  console.log('🔨 Running flutter doctor')
  await run('flutter', ['doctor'])

  status.show({ summary: 'Flutter, Java, and Android SDK installed' })
}
