import { log } from '@/app/shared/log'
import { appState } from '@/app/app'
import { rendererIPC } from './rendererEvent'
import { update } from '@/app/shared/update'

// TODO
function sendStatusToWindow(text: string) {
  log.info(text)
  // ipcMain.send('message', text)
}

export const initUpdate = () => {
  update.on('checking_for_update', () => {
    sendStatusToWindow('Checking for update...')
    void rendererIPC.updateInfo({
      type: 'checking',
    })
  })
  update.on('update_available', (info) => {
    sendStatusToWindow('Update available.')
    void rendererIPC.updateInfo({
      type: 'available',
      info: {
        version: info.version,
        isAutoUpdate: appState.appSetting['common.tryAutoUpdate'],
        // url: info.
        desc: info.desc,
        // isForce: boolean
      },
    })
  })
  update.on('update_not_available', (info) => {
    sendStatusToWindow('Update not available.')
    void rendererIPC.updateInfo({
      type: 'not_available',
      info,
    })
  })
  update.on('error', (err) => {
    sendStatusToWindow('Error in auto_updater.')
    void rendererIPC.updateInfo({
      type: 'error',
      message: err.message,
    })
  })
  update.on('download_progress', (progressObj) => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`
    logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`
    logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`
    sendStatusToWindow(logMessage)
    void rendererIPC.updateInfo({
      type: 'download_progress',
      info: progressObj,
    })
  })
  update.on('update_downloaded', (info) => {
    sendStatusToWindow('Update downloaded.')
    void rendererIPC.updateInfo({
      type: 'downloaded',
    })
  })
}

export const checkUpdate = async () => {
  return update.checkForUpdates(appState.appSetting['common.tryAutoUpdate'])
}

export const downloadUpdate = async () => {
  if (!(await update.isUpdaterActive())) return
  void update.downloadUpdate()
}

export const restartUpdate = () => {
  // appActions.setSkipTrayQuit(true)

  setTimeout(() => {
    void update.quitAndInstall()
  }, 1000)
}
