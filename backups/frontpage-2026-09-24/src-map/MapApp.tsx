import { useEffect, useState } from 'react'
import { Button, LoadingOverlay, MantineProvider, ScrollArea, Tooltip } from '@mantine/core'
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
      <div className="relative">
        <LoadingOverlay visible={!mxManager} overlayProps={{ blur: 2 }} />
        <div className="flex flex-col md:flex-row overflow-hidden md:h-app">
          {/* Sidebar */}
          <div
            className={classNames([
              'relative h-app-mobile md:h-full',
              {
                'md:hidden': fullPage,
                'md:w-1/3': !fullPage,
              },
            ])}
          >
            <ScrollArea className="h-app-mobile md:h-full">{mxManager && <Views mxManager={mxManager} />}</ScrollArea>
          </div>

          {/* Map */}
          <div
            className={classNames([
              'presentation-map relative shadow-map-mobile md:shadow-none h-app-mobile md:h-full w-full md:w-1/2',
              {
                'md:w-full': fullPage,
                'md:w-2/3': !fullPage,
              },
            ])}
          >
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
            <Tooltip label="Show the list">
              <Button
                variant="subtle"
                color="dark"
                className={classNames([
                  'absolute md:flex items-center justify-center hidden bottom-[40px] left-3 my-auto z-10 bg-white shadow-xl font-medium',
                ])}
                onClick={() => setFullPage(!fullPage)}
              >
                {!fullPage && <Symbol value="chevron_left" />}
                {fullPage && (
                  <div className="flex items-center justify-center space-x-2">
                    <Symbol value="chevron_right" />
                    <div>Show the list</div>
                  </div>
                )}
              </Button>
            </Tooltip>
            <div className="w-full h-full" ref={(el) => setMxContainer(el)} />
          </div>
        </div>
      </div>
    </MantineProvider>
  )
}