"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("./enums");
const { windowManager } = require("node-window-manager");
const childProcess = require('child_process');
const open = require('open');
const notifier = require('node-notifier');
const path = require('path');
function switchMessage(type, data) {
    notifier.notify({
        title: 'Switch - ' + data.title,
        message: data.message,
        icon: path.join(enums_1.Switch.APP_PATH, enums_1.Switch.NOTI_ICON),
        sound: true,
        wait: true,
        hotApp: (data.hotApp) ? data.hotApp : null
    });
}
exports.switchMessage = switchMessage;
function registerNotifierOnClick() {
    const onclick = debounce((notifierObject, options, event) => {
        console.log(options.hotApp);
        if (options.hotApp)
            openHotApp(options.hotApp.path);
    }, 3000, false);
    notifier.on('click', onclick);
}
exports.registerNotifierOnClick = registerNotifierOnClick;
function getHotApps() {
    return [{
            name: 'Brave',
            keycode: 11,
            path: 'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
        }, {
            name: 'Code',
            keycode: 10,
            path: 'C:\\Program Files\\Microsoft VS Code\\Code.exe'
        }, {
            name: 'MagicaVoxel',
            keycode: 9,
            path: 'C:\\Program Files\\MagicaVoxel-0.98.2-win\\MagicaVoxel.exe'
        }];
}
exports.getHotApps = getHotApps;
function whichHotApp(keycode, hotApps) {
    let whichHotWindowToOpen = hotApps.filter(app => app.keycode == keycode);
    if (whichHotWindowToOpen.length == 0)
        return null;
    return whichHotWindowToOpen[0];
}
exports.whichHotApp = whichHotApp;
function getAllProcessThatMatchPath(path) {
    let processes = windowManager.getWindows().filter(window => window.path == path);
    if (processes == null || processes.length == 0)
        return null;
    return processes;
}
exports.getAllProcessThatMatchPath = getAllProcessThatMatchPath;
function getAllProcessThatMatchAppName(name) {
    let processes = windowManager.getWindows().filter(window => window.getTitle().includes(name));
    if (processes == null || processes.length == 0)
        return null;
    return processes;
}
exports.getAllProcessThatMatchAppName = getAllProcessThatMatchAppName;
function clearCurrentWidow() {
    const currentWindow = windowManager.getActiveWindow();
    if (currentWindow.isWindow()) {
        try {
            currentWindow.minimize();
        }
        catch (e) { }
    }
}
exports.clearCurrentWidow = clearCurrentWidow;
function MakeHotAppActive(hotProcesses) {
    for (let i = 0; i < hotProcesses.length; i++) {
        if (hotProcesses[i].isWindow()) {
            console.log(hotProcesses);
            hotProcesses[i].bringToTop();
            hotProcesses[i].maximize();
            break;
        }
    }
}
exports.MakeHotAppActive = MakeHotAppActive;
function openHotApp(path) {
    console.log('ppp', path);
    open(path);
}
exports.openHotApp = openHotApp;
function debounce(callback, wait, immediate = false) {
    let timeout = null;
    return function () {
        const callNow = immediate && !timeout;
        const next = () => callback.apply(this, arguments);
        clearTimeout(timeout);
        timeout = setTimeout(next, wait);
        if (callNow) {
            next();
        }
    };
}
//# sourceMappingURL=utils.js.map