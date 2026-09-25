import { useEffect, useState } from 'react'
import { Button, LoadingOverlay, MantineProvider, Tooltip } from '@mantine/core'
import classNames from 'classnames'
import lightTheme from './data/mx_theme_unccd_light.json'
import darkTheme from './data/mx_theme_unccd_dark.json'

import Views from './components/Views'
import Symbol from './components/Symbol'
import { sdkManager, type MxSdkManager } from './services/Mapx'
import './services/ObjectsPropertiesAddOns'

export interface MxTheme {
  colors: Record<string, string>
}

export default function MapApp() {
  const [mxContainer, setMxContainer] = useState<HTMLDivElement | null>(null)
  const [mxManager, setMxManager] = useState<MxSdkManager | null>(null)
  const [fullPage, setFullPage] = useState(false)
  const [toggle3dTerrain, setToggle3dTerrain] = useState(false)
  const [toggleAerialImagery, setToggleAerialImagery] = useState(false)
  const [toggleDarkTheme, setToggleDarkTheme] = useState(false)
  const [toggleZoomIn, setToggleZoomIn] = useState(false)
  const [toggleZoomOut, setToggleZoomOut] = useState(false)
  const [toggleGlobe, setToggleGlobe] = useState(false)
  const [toggleMapComposer, setToggleMapComposer] = useState(false)
  const [toggleGeocoder, setToggleGeocoder] = useState(false)

  useEffect(() => {
    void (async function () {
      if (mxContainer && !mxManager) {
        const manager = await sdkManager(mxContainer)
        void manager.ask('set_theme', { colors: lightTheme.colors })
        setMxManager(manager)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mxContainer])

  useEffect(() => {
    if (mxManager) {
      void mxManager.ask('show_modal_map_composer', { action: toggleMapComposer ? 'enable' : 'disable' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleMapComposer])

  useEffect(() => {
    if (mxManager) {
      void mxManager.ask('set_3d_terrain', { action: toggle3dTerrain ? 'enable' : 'disable' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle3dTerrain])

  useEffect(() => {
    if (mxManager) {
      void mxManager.ask('set_mode_aerial', { action: toggleAerialImagery ? 'show' : 'hide' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleAerialImagery])

  useEffect(() => {
    if (mxManager) {
      void mxManager.ask('set_theme', {
        colors: toggleDarkTheme ? darkTheme.colors : lightTheme.colors,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleDarkTheme])

  // Geocoder toggle effect
  useEffect(() => {
    if (mxManager) {
      const modaGeocoder = toggleGeocoder ? 'show_modal_geocoder' : 'close_modal_geocoder'
      void mxManager.ask(modaGeocoder)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleGeocoder])

  // ZoomIn effect
  useEffect(() => {
    if (mxManager) {
      void mxManager.ask('map', {
        method: 'zoomIn',
        parameters: ['duration', '1000'],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleZoomIn])

  useEffect(() => {
    if (mxManager) {
      void mxManager.ask('map', {
        method: 'zoomOut',
        parameters: ['offset', [80, 60]],
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleZoomOut])

  useEffect(() => {
    if (mxManager) {
      void mxManager.ask('map', {
        method: 'setProjection',
        parameters: [
          {
            name: toggleGlobe ? 'globe' : 'naturalEarth',
          },
        ],
      })
      void mxManager.ask('map_fly_to', { center: [15, 20.362], zoom: 2 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleGlobe])

  return (
    <MantineProvider theme={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="presentation-map relative w-full h-app-mobile md:h-app overflow-hidden bg-white">
        <LoadingOverlay visible={!mxManager} overlayProps={{ blur: 2 }} />

        {/* Full-bleed map canvas */}
        <div className="absolute inset-0" ref={(el) => setMxContainer(el)} />

        {/* Floating left panel */}
        {!fullPage && mxManager && (
           <aside className="absolute top-3 left-3 bottom-3 right-3 md:right-auto z-20 flex flex-col md:w-[500px] md:max-w-[85%]">
            <div className="flex-1 min-h-0 overflow-hidden rounded-xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <Views mxManager={mxManager} />
            </div>
            <button
              aria-label="Hide the list"
              className="absolute -right-4 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
              onClick={() => setFullPage(true)}
            >
              <Symbol value="chevron_left" />
            </button>
          </aside>
        )}
        {fullPage && (
          <button
            className="absolute left-3 top-1/2 z-30 flex h-9 -translate-y-1/2 items-center justify-center gap-1 rounded-lg bg-white px-3 font-medium shadow-xl"
            onClick={() => setFullPage(false)}
          >
            <Symbol value="chevron_right" />
            <div>Show the list</div>
          </button>
        )}
            <div className={classNames(['interact-with-map absolute flex flex-col space-y-2 items-center justify-center top-3 right-3 my-auto z-10 font-medium'])}>
              <div
                className={classNames(['flex flex-col space-y-2 items-center justify-center top-3 right-3 my-auto z-10 font-medium'])}
              >
                <Tooltip label="Help">
                  <Button
                    variant="subtle"
                    color="dark"
                    className={classNames(['interact-normal-theme', 'active-help', 'shadow-xl', 'bg-white'])}
                  >
                    <div className="flex items-center justify-center">
                      <Symbol value="live_help" className="fill" />
                      <div hidden>Toggle Help</div>
                    </div>
                  </Button>
                </Tooltip>
                <Tooltip label="Zoom Out">
                  <Button
                    variant="subtle"
                    color="dark"
                    className={classNames(['interact-zoom-out', 'shadow-xl', 'bg-white'])}
                    onClick={() => setToggleZoomOut(!toggleZoomOut)}
                  >
                    <div className="flex items-center justify-center">
                      <Symbol value="zoom_out" className={'fill'} />
                      <div hidden>ZoomOut</div>
                    </div>
                  </Button>
                </Tooltip>
                <Tooltip label="Zoom In">
                  <Button
                    variant="subtle"
                    color="dark"
                    className={classNames(['interact-zoom-in', 'shadow-xl', 'bg-white'])}
                    onClick={() => setToggleZoomIn(!toggleZoomIn)}
                  >
                    <div className="flex items-center justify-center">
                      <Symbol value="zoom_in" className={'fill'} />
                      <div hidden>ZoomIn</div>
                    </div>
                  </Button>
                </Tooltip>
              </div>
              <Tooltip label="3D Terrain">
                <Button
                  variant="subtle"
                  color="dark"
                  className={classNames(['interact-landscape', 'shadow-xl'], {
                    'bg-white': !toggle3dTerrain,
                    'bg-gray-7': toggle3dTerrain,
                  })}
                  onClick={() => setToggle3dTerrain(!toggle3dTerrain)}
                >
                  <div className="flex items-center justify-center">
                    <Symbol value="landscape" className={'fill'} />
                    <div hidden>Add 3D terrain</div>
                  </div>
                </Button>
              </Tooltip>
              <Tooltip label="Globe">
                <Button
                  variant="subtle"
                  color="dark"
                  className={classNames(['interact-globe', 'shadow-xl'], {
                    'bg-white': !toggleGlobe,
                    'bg-gray-7': toggleGlobe,
                  })}
                  onClick={() => setToggleGlobe(!toggleGlobe)}
                >
                  <div className="flex items-center justify-center">
                    <Symbol value="globe" className={'fill'} />
                    <div hidden>Enable Globe</div>
                  </div>
                </Button>
              </Tooltip>
              <Tooltip label="Aerial Imagery">
                <Button
                  variant="subtle"
                  color="dark"
                  className={classNames(['interact-travel', 'shadow-xl'], {
                    'bg-white': !toggleAerialImagery,
                    'bg-gray-7': toggleAerialImagery,
                  })}
                  onClick={() => setToggleAerialImagery(!toggleAerialImagery)}
                >
                  <div className="flex items-center justify-center">
                    <Symbol value="travel" />
                    <div hidden>Add an aerial imagery layer</div>
                  </div>
                </Button>
              </Tooltip>
              <Tooltip label="Dark Theme">
                <Button
                  variant="subtle"
                  color="dark"
                  className={classNames(['interact-dark-theme', 'shadow-xl'], {
                    'bg-white': !toggleDarkTheme,
                    'bg-gray-7': toggleDarkTheme,
                  })}
                  onClick={() => setToggleDarkTheme(!toggleDarkTheme)}
                >
                  <div className="flex items-center justify-center">
                    <Symbol value="clear_night" className="fill" />
                    <div hidden>Toggle dark theme</div>
                  </div>
                </Button>
              </Tooltip>
              <Tooltip label="Map Composer">
                <Button
                  variant="subtle"
                  color="dark"
                  className={classNames(['interact-map', 'shadow-xl'], {
                    'bg-white': !toggleMapComposer,
                    'bg-gray-7': toggleMapComposer,
                  })}
                  onClick={() => setToggleMapComposer(!toggleMapComposer)}
                >
                  <div className="flex items-center justify-center">
                    <Symbol value="map" className="fill" />
                    <div hidden>Toggle Map Composer</div>
                  </div>
                </Button>
              </Tooltip>
              <Tooltip label="Map Geocoder">
                <Button
                  variant="subtle"
                  color="dark"
                  className={classNames(['interact-geocoder', 'shadow-xl'], {
                    'bg-white': !toggleGeocoder,
                    'bg-gray-7': toggleGeocoder,
                  })}
                  onClick={() => setToggleGeocoder(!toggleGeocoder)}
                >
                  <div className="flex items-center justify-center">
                    <Symbol value="search" className="fill" />
                    <div hidden>Toggle Geocoder</div>
                  </div>
                </Button>
              </Tooltip>
            </div>
        </div>
      </MantineProvider>
  )
}