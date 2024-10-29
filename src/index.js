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
  console.log('☕️ Installing Java')
  await run('wget', [
    'https://download.oracle.com/java/17/archive/jdk-17.0.12_linux-x64_bin.tar.gz',
    '-O',
    'jdk.tar.gz',
  ])
  await run('mkdir', ['-p', javaPath])
  await run('tar', ['-xzf', 'jdk.tar.gz', '-C', javaPath, '--strip-components=1'])
  process.env['JAVA_HOME'] = javaPath
  process.env['PATH'] = process.env['PATH'] + ':' + javaPath + '/bin'
  console.log('✅ Java installed')

  // Install Android SDK
  console.log('📱 Downloading Android SDK')
  await run('mkdir', ['-p', androidSdkPath])
  await run('wget', [
    'https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip',
    '-O',
    'cmdline-tools.zip',
  ])
  
  console.log('📂 Extracting Android command-line tools')
  await run('mkdir', ['-p', `${androidSdkPath}/cmdline-tools`])
  await run('unzip', ['cmdline-tools.zip', '-d', `${androidSdkPath}/cmdline-tools`])
  await run('mv', [
    `${androidSdkPath}/cmdline-tools/cmdline-tools`,
    `${androidSdkPath}/cmdline-tools/latest`,
  ])
  console.log('✅ Android SDK command-line tools installed')

  // Setting ANDROID_HOME and PATH again to ensure visibility for all commands
  process.env['ANDROID_HOME'] = androidSdkPath
  process.env['PATH'] = 
    `${androidSdkPath}/cmdline-tools/latest/bin:${androidSdkPath}/platform-tools:` + process.env['PATH']

  console.log('🔧 Setting up Android SDK packages')
  await run(`${androidSdkPath}/cmdline-tools/latest/bin/sdkmanager`, [
    'platform-tools',
    'platforms;android-30',
    'build-tools;30.0.3',
  ], { input: 'y\n' })  // Provide "yes" input directly

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
  process.env['PATH'] = flutterBinPath + ':' + process.env['PATH']

  console.log('🔨 Running flutter doctor')
  await run('flutter', ['doctor'])

  status.show({ summary: 'Flutter, Java, and Android SDK installed' })
}
