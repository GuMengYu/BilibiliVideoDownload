// import { contextBridge, ipcRenderer } from 'electron'

function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const styleContent = `body {
  align-items: center;
  display: flex;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #404943;
  z-index: 9999;
}
.gegga {
  width: 0;
}
.snurra {
  filter: url(#gegga);
}
.stopp1 {
  stop-color: #f700a8;
}
.stopp2 {
  stop-color: #ff8000;
}
.halvan {
  animation: Snurra1 10s infinite linear;
  stroke-dasharray: 180 800;
  fill: none;
  stroke: url(#gradient);
  stroke-width: 23;
  stroke-linecap: round;
}
.strecken {
  animation: Snurra1 3s infinite linear;
  stroke-dasharray: 26 54;
  fill: none;
  stroke: url(#gradient);
  stroke-width: 23;
  stroke-linecap: round;
}
.skugga {
  filter: blur(5px);
  opacity: 0.3;
  position: absolute;
  transform: translate(3px, 3px);
}
@keyframes Snurra1 {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -403px;
  }
}
`
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<svg class="gegga">
      <defs>
        <filter id="gegga">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10"
            result="inreGegga"
          />
          <feComposite in="SourceGraphic" in2="inreGegga" operator="atop" />
        </filter>
      </defs>
    </svg>
<svg class="snurra" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="linjärGradient">
          <stop class="stopp1" offset="0" />
          <stop class="stopp2" offset="1" />
        </linearGradient>
        <linearGradient
          y2="160"
          x2="160"
          y1="40"
          x1="40"
          gradientUnits="userSpaceOnUse"
          id="gradient"
          xlink:href="#linjärGradient"
        />
      </defs>
      <path
        class="halvan"
        d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"
      />
      <circle class="strecken" cx="100" cy="100" r="64" />
    </svg>
<svg class="skugga" width="200" height="200" viewBox="0 0 200 200">
      <path
        class="halvan"
        d="m 164,100 c 0,-35.346224 -28.65378,-64 -64,-64 -35.346224,0 -64,28.653776 -64,64 0,35.34622 28.653776,64 64,64 35.34622,0 64,-26.21502 64,-64 0,-37.784981 -26.92058,-64 -64,-64 -37.079421,0 -65.267479,26.922736 -64,64 1.267479,37.07726 26.703171,65.05317 64,64 37.29683,-1.05317 64,-64 64,-64"
      />
      <circle class="strecken" cx="100" cy="100" r="64" />
    </svg>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      oStyle.remove()
      oDiv.remove()
      // safeDOM.remove(document.head, oStyle)
      // safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

// setTimeout(removeLoading, 4999)

// contextBridge.exposeInMainWorld('electron', {
//   openBrowser (url) {
//     ipcRenderer.send('open-browser', url)
//   },
//   openPath (path) {
//     ipcRenderer.send('open-path', path)
//   },
//   openDirDialog () {
//     return ipcRenderer.invoke('open-dir-dialog')
//   },
//   got (url, option) {
//     return ipcRenderer.invoke('got', url, option)
//   },
//   gotBuffer (url, option) {
//     return ipcRenderer.invoke('got-buffer', url, option)
//   },
//   getStore (path) {
//     return ipcRenderer.invoke('get-store', path)
//   },
//   setStore (path, data) {
//     ipcRenderer.send('set-store', path, data)
//   },
//   deleteStore (path) {
//     ipcRenderer.send('delete-store', path)
//   },
//   showContextmenu (type) {
//     return ipcRenderer.invoke('show-context-menu', type)
//   },
//   openDir (list) {
//     ipcRenderer.send('open-dir', list)
//   },
//   openDeleteVideoDialog (count) {
//     return ipcRenderer.invoke('open-delete-video-dialog', count)
//   },
//   deleteVideos (list) {
//     return ipcRenderer.invoke('delete-videos', list)
//   },
//   downloadVideo (task) {
//     ipcRenderer.send('download-video', task)
//   },
//   getVideoSize (id) {
//     return ipcRenderer.invoke('get-video-size', id)
//   },
//   closeApp () {
//     ipcRenderer.send('close-app')
//   },
//   minimizeApp () {
//     ipcRenderer.send('minimize-app')
//   },
//   openReloadVideoDialog (count) {
//     return ipcRenderer.invoke('open-reload-video-dialog', count)
//   },
//   saveDanmukuFile (content, path) {
//     ipcRenderer.send('save-danmuku-file', content, path)
//   },
//   on (channel, func) {
//     const validChannels = [
//       'download-video-status',
//       'download-danmuku'
//     ]
//     if (validChannels.includes(channel)) {
//       const subscription = (_event, ...args) =>
//         func(...args)
//       // Deliberately strip event as it includes `sender`
//       ipcRenderer.on(channel, subscription)
//
//       return () => ipcRenderer.removeListener(channel, subscription)
//     }
//
//     return undefined
//   },
//   once (channel, func) {
//     const validChannels = ['init-store']
//     if (validChannels.includes(channel)) {
//       // Deliberately strip event as it includes `sender`
//       ipcRenderer.once(channel, (_event, ...args) => func(...args))
//     }
//   }
// })
