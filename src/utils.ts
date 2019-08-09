import { SwitchNotiMessage, SwitchHotApp } from './interfaces';
import { Switch } from './enums';
const { windowManager } = require("node-window-manager");
const fs = require('fs');
const open = require('open');

const notifier = require('node-notifier');
const path = require('path');
const blackList = ['explorer.exe'];


/**
 * Sends crossplatform notification to the user
 * @param  {Switch.ERROR_NOTI | Switch.INFO_NOTI} type Type of notification
 * @param  {SwitchNotiMessage} data Information to be send
 * @param  {} callback? If present, activation to do when user reponds to notifcation
 */

export function switchMessage(type: Switch.ERROR_NOTI | Switch.INFO_NOTI, data: SwitchNotiMessage) {

    notifier.notify(
        {
            title: 'Switch - ' + data.title,
            message: data.message,
            icon: path.join(Switch.APP_PATH, Switch.NOTI_ICON), // Absolute path (doesn't work on balloons)
            sound: true, // Only Notification Center or Windows Toasters
            wait: true, // Wait with callback, until user action is taken against notification
            hotApp: (data.hotApp) ? data.hotApp : null
        });
}


export function registerNotifierOnClick() {
    const onclick = debounce((notifierObject, options, event) => {
        // if hot app is present use its' path path property to open hot app.
        console.log(options.hotApp)
        if (options.hotApp) openHotApp(options.hotApp.path);

    }, 3000, false);
    notifier.on('click', onclick);
}


/**
 * Get the list of saved user's favourite apps
 */

export function getHotApps(): SwitchHotApp[] {
    let rawdata = fs.readFileSync(path.join(__dirname, 'switch.json'));
    return JSON.parse(rawdata);
}

/*
 * Saves hot app into persistent json file on disk
 */
export function saveHotApps(data) {
    fs.writeFile(path.join(__dirname, 'switch.json'), JSON.stringify(data), (err) => {
        if (err) throw err;
        console.log('[info] Saved hot apps!');
    });
}

/**
 * Returns a hot app that matches the given hot rawcode
 * @param  {number} rawcode
 * @param  {SwitchHotApp[]} hotApps
 * @returns SwitchHotApp
 */

export function whichHotApp(rawcode: number, hotApps: SwitchHotApp[]): SwitchHotApp | null {
    let whichHotWindowToOpen = hotApps.filter(app => app.rawcode == rawcode);
    if (whichHotWindowToOpen.length == 0) return null;
    return whichHotWindowToOpen[0];
}

/**
 * Returns all processes that matches the specified path
 * @param  {string} path
 * @returns Window
 */
export function getAllProcessThatMatchPath(_path: string) {
    let processes = windowManager.getWindows().filter(window => path.basename(window.path) ==  path.basename(_path));
    if (processes == null || processes.length == 0) return null;
    return processes;
}

export function getProcessWithPID(pid: number)
{

    console.log(pid)
    let process = windowManager.getWindows().filter(window => window.processId == pid);
    if(process.length == 0) return null;
    return process[0];
}

/**
 * Returns all processes that matches the specified app name
 * @param  {string} name
 * @returns Window
 */
export function getAllProcessThatMatchAppName(name: string, path: string) {
    let processes = windowManager.getWindows().filter(window=>window.getTitle().toLowerCase().includes(name.split('.exe')[0].toLowerCase().replace('_', ' ')) && window.path.toLowerCase() == path.toLowerCase());
    if (processes == null || processes.length == 0) return null;
    return processes;
}

/**
 * Minimize current window
 */
export function clearCurrentWidow() {
    const currentWindow = windowManager.getActiveWindow();
    if (currentWindow.isWindow()) {
        try {
            currentWindow.minimize();
        } catch (e) { }
    }
}

/**
 * Makes hot process that is a window active
 * 1. gets the list of hot processes
 * 2. sorts them in ascending order of their pid
 * 3. checks if the least pid is a window
 * 4. brings it to top
 * 5. else looks next least pid that it a window in the list
 * 6. the brings it to the top
 * 
 * @param  {} hotProcesses - List of matched hot processess
 */

export function MakeHotAppActive(hotProcesses: any[]) {
    // look for the least pid and is a window.
    hotProcesses.sort(function (a, b) {
        return b.processId - a.processId
    });
    console.log(hotProcesses);
    // least pid 
    let least = hotProcesses[0];
    // if is a window, bring it up and make active
    if (least.isWindow()) {
        least.bringToTop();
        least.maximize();
    } else {
        // else loop to the rest and find the 1st windowed process..
        // remove the least one
        least  = hotProcesses;
        least.shift();
        for (let i = 0; i < least.length; i++) {
            if (least[i].isWindow()) {
                // Then bring the window to the top.
                const hot = least[i];
                hot.bringToTop();
                hot.maximize();
                break;
            }
        }

    }

    minimizeAllHotAppsExceptCurrentHotApp(least);
}

/**
 * Opens a hotApp with the provided path
 * @param  {string} path
 */
export function openHotApp(path: string) {
    open(path);
}

/**
 * Debouncing enforces that a function not be called again until
 * a certain amount of time has passed without it being called
 * @param  {} callback
 * @param  {} wait
 * @param  {} immediate=false
 */
function debounce(callback, wait, immediate = false) {
    let timeout = null

    return function () {
        const callNow = immediate && !timeout
        const next = () => callback.apply(this, arguments)

        clearTimeout(timeout)
        timeout = setTimeout(next, wait)

        if (callNow) {
            next()
        }
    }
}

/**
 * Minimizes current window.
 * Useful to prevent user from tying uncessary input..
 */

export function minimizeCurrentWindow() {
    const current = windowManager.getActiveWindow();
    const info = current.getInfo();
    // prevent minizing black listed apps..
    if (blackList.filter(item => info.path.includes(item)).length > 0) { console.log('cannot minize'); return };
    if (current.isWindow()) {
        current.minimize();
        current.show();
    }
}

export function minimizeAllHotAppsExceptCurrentHotApp(currentHotApp)
{
    // also minize all windows in hot apps..
    // const hotApps = getHotApps().filter(hot=>hot.path.toLowerCase()!=currentHotApp.path.toLowerCase());
    // console.log(hotApps);
    // hotApps.forEach(app=>{
    //     let windows = getAllProcessThatMatchAppName(app.name, app.path);
    //     if(windows !== null)
    //     {
    //         windows.forEach(window=>{
    //             if(window.isWindow())
    //             {
    //                 window.minimize();
    //             }
    //         });
    //     }
    // })
}