import https from 'https';

const javaDownloadUrl = 'https://download.oracle.com/java/17/archive/jdk-17.0.12_linux-x64_bin.tar.gz'

const javaPath = process.env['HOME'] + '/java'
const androidSdkPath = process.env['HOME'] + '/android-sdk'
const flutterPath = process.env['HOME'] + '/flutter'
const flutterBinPath = flutterPath + '/bin'

export const onPreBuild = async function ({
  inputs,
  utils: { build, status, cache, run },
}) {
  /*
    Install Java
  */
  console.log('☕️ Installing Java')
  await run('wget', [javaDownloadUrl, '-O', 'jdk.tar.gz'])
  await run('mkdir', ['-p', javaPath])
  await run('tar', ['-xzf', 'jdk.tar.gz', '-C', javaPath, '--strip-components=1'])
  process.env['JAVA_HOME'] = javaPath
  process.env['PATH'] = process.env['PATH'] + ':' + javaPath + '/bin'
  console.log('✅ Java installed')

  /*
    Install Android SDK
  */
  console.log('📥 Fetching latest Android cmd-line tools URL');
  let androidSdkDownloadUrl;
  try {
    androidSdkDownloadUrl = await getAndroidSdkDownloadUrl();
  } catch (error) {
    console.error('Failed to get the tools download URL:', error);
    return build.failBuild('Could not fetch the Android SDK command-line tools URL');
  }
  console.log('✅ Latest URL:', androidSdkDownloadUrl);
 
  console.log('📱 Installing Android SDK')
  await run('mkdir', ['-p', androidSdkPath])
  await run('wget', [androidSdkDownloadUrl, '-O', 'cmdline-tools.zip'])
  await run('mkdir', ['-p', `${androidSdkPath}/cmdline-tools`])
  await run('unzip', ['cmdline-tools.zip', '-d', `${androidSdkPath}/cmdline-tools`])
  await run('mv', [
    `${androidSdkPath}/cmdline-tools/cmdline-tools`,
    `${androidSdkPath}/cmdline-tools/latest`,
  ])
  process.env['ANDROID_HOME'] = androidSdkPath
  const env = {
    ANDROID_HOME: androidSdkPath,
    PATH: `${androidSdkPath}/cmdline-tools/latest/bin:${androidSdkPath}/platform-tools:${process.env['PATH']}`
  }
  await run(`${androidSdkPath}/cmdline-tools/latest/bin/sdkmanager`, [
    'platform-tools',
    'platforms;android-34',
    'build-tools;34.0.0',
  ], { input: 'y\n', env })
  console.log('✅ Android SDK installed')

  /*
    Install Flutter
  */
  console.log('⚡️ Installing Flutter SDK')
  const targetChannel = 'stable'
  await run('git', [
    'clone',
    'https://github.com/flutter/flutter.git',
    '-b',
    targetChannel,
    process.env['HOME'] + '/flutter',
  ])
  process.env['PATH'] = process.env['PATH'] + ':' + flutterBinPath
  console.log('✅ Flutter SDK installed')

  /*
    Finishing
  */
  status.show({ summary: 'Flutter, Java and Android SDK installed' })
}

// Function to get the latest command-line tools URL
const getAndroidSdkDownloadUrl = () => new Promise((resolve, reject) =>
  https.get('https://developer.android.com/studio', (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      const match = data.match(/https:\/\/dl\.google\.com\/android\/repository\/commandlinetools\-linux\-[0-9]*_latest\.zip/);
      if (match) {
        resolve(match[0]);
      } else {
        reject(new Error('Download URL not found'));
      }
    });
  }).on('error', reject)
);
