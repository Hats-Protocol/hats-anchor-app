// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getOperatingSystem(window: any) {
  if (!window) return '';
  let operatingSystem = 'Not known';
  if (window.navigator.appVersion.indexOf('Win') !== -1) {
    operatingSystem = 'Windows';
  }
  if (window.navigator.appVersion.indexOf('Mac') !== -1) {
    operatingSystem = 'Mac';
  }
  if (window.navigator.appVersion.indexOf('X11') !== -1) {
    operatingSystem = 'Unix';
  }
  if (window.navigator.appVersion.indexOf('Linux') !== -1) {
    operatingSystem = 'Linux';
  }

  return operatingSystem;
}

// function getBrowser(window) {
//   let currentBrowser = 'Not known';
//   if (window.navigator.userAgent.indexOf('Chrome') !== -1) {
//     currentBrowser = 'Google Chrome';
//   } else if (window.navigator.userAgent.indexOf('Firefox') !== -1) {
//     currentBrowser = 'Mozilla Firefox';
//   } else if (window.navigator.userAgent.indexOf('MSIE') !== -1) {
//     currentBrowser = 'Internet Exployer';
//   } else if (window.navigator.userAgent.indexOf('Edge') !== -1) {
//     currentBrowser = 'Edge';
//   } else if (window.navigator.userAgent.indexOf('Safari') !== -1) {
//     currentBrowser = 'Safari';
//   } else if (window.navigator.userAgent.indexOf('Opera') !== -1) {
//     currentBrowser = 'Opera';
//   } else if (window.navigator.userAgent.indexOf('Opera') !== -1) {
//     currentBrowser = 'YaBrowser';
//   } else {
//     console.log('Others');
//   }

//   return currentBrowser;
// }
