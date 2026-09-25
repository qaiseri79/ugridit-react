import Fuse from 'fuse.js'
import jsonData from '../data/data_unccd_map.json'

const HOST = 'mapx.org'

const SEARCH_API_KEY = 'a60a7dadd385fec3815cfa22d8e536a98f2e80d7bddb2c6c3276b68c33d9d8b8'

export interface MxView {
  view_id: string
  view_type?: string
  mapx_folder_0?: string
  mapx_folder_1?: string
  view_title?: string
  order_cat?: number
  order_views?: number
  id?: number
  default_on?: boolean
  view_abstract?: string
  view_created_at?: number
  source_note?: string
  source_released_at?: number
  source_keywords?: string[]
  source_keywords_m49?: string[]
  source_title?: string
  source_abstract?: string
  projects_id?: string[]
  [key: string]: unknown
}

const options = {
  includeMatches: true,
  findAllMatches: true,
  threshold: 0.2,
  ignoreLocation: true,
  keys: ['view_title', 'section', 'topic', 'subtopic'],
}

type MxViewFuse = MxView & { item?: MxView }

function fuseCustomJsFetch(value: string): Promise<Array<MxViewFuse>> {
  return Promise.resolve().then(() => {
    const fuse = new Fuse(jsonData as MxView[], options)
    const results: Array<Array<MxViewFuse>> = []
    if ('' !== value) {
      results.push(fuse.search(value) as unknown as Array<MxViewFuse>)
    } else {
      results.push(jsonData as unknown as Array<MxViewFuse>)
    }
    try {
      return results.flat()
    } catch (error) {
      throw new Error(`Fuse search error: ${String(error)}`, { cause: error })
    }
  })
}

function fetchViewFromJsonFile(filters: string[] | null = null): Promise<MxView[]> {
  const jsonDataRows = jsonData as MxView[]
  let idViews1 = 1
  jsonDataRows.forEach((value) => {
    value.id = idViews1++
  })
  return new Promise((resolve) => {
    let searchTerm: string[] = filters ?? []
    const searchResultsJson: MxView[][] = []

    if (Array.isArray(searchTerm)) {
      if (1 == searchTerm.length && searchTerm.includes('biophysical')) {
        searchTerm = []
      } else if ('biophysical' == searchTerm[0] && 1 < searchTerm.length && searchTerm.length <= 7) {
        searchTerm.shift()
      } else if (1 == searchTerm.length && searchTerm.includes('threats')) {
        searchTerm = []
      } else if ('threats' == searchTerm[0] && 1 < searchTerm.length && searchTerm.length <= 7) {
        searchTerm.shift()
      }

      searchTerm.forEach((element) => {
        if (
          element === 'base maps' ||
          element === 'biophysical' ||
          element === 'threats' ||
          element === 'climate data' ||
          element === 'socio-economics'
        ) {
          const searchResult = jsonDataRows.filter((item) => {
            return item.mapx_folder_0?.includes(element.charAt(0).toUpperCase() + element.slice(1))
          })
          searchResultsJson.push(searchResult)
        } else if (
          element === 'deforestation' ||
          element === 'drought' ||
          element === 'fires' ||
          element === 'Near Real-time Fires' ||
          element === 'land status' ||
          element === 'burned areas' ||
          element === 'restoration' ||
          element === 'population'
        ) {
          const searchResult = jsonDataRows.filter((item) => {
            if (typeof item.mapx_folder_1 !== 'undefined') {
              return item.mapx_folder_1.includes(element.charAt(0).toUpperCase() + element.slice(1))
            }
            return false
          })
          searchResultsJson.push(searchResult)
        }
      })
    } else {
      const scalarTerm = String(searchTerm)
      const searchResultsFlat = jsonDataRows.filter((item) => {
        return item.mapx_folder_0?.includes(scalarTerm)
      })
      searchResultsJson.push(searchResultsFlat)
    }

    resolve(searchResultsJson.flat())
  })
}

function apiSearchViewsFetch(q = '', filters: string | null = null, facetFilters: string[][] | null = null): Promise<MxView[]> {
  const jsonDataRows = jsonData as MxView[]
  let idViews1 = 1
  jsonDataRows.forEach((value) => {
    value.id = idViews1++
  })

  return new Promise((resolve, _reject) => {
    fetch(`https://search.${HOST}/indexes/views_en/search`, {
      method: 'POST',
      headers: {
        'X-Meili-API-Key': SEARCH_API_KEY,
      },
      body: JSON.stringify({
        q: q,
        filters: filters,
        facetFilters: [
          [
            'projects_id:MX-0SA-E4R-H05-H6Z-F3O',
            'projects_id:MX-L2W-HWZ-RIC-LM1-Y0V',
            'projects_id:MX-A3M-LVK-V7S-XOT-J48',
          ],
          ...(facetFilters ?? []),
        ],
        facetsDistribution: ['source_keywords'],
        limit: 400,
      }),
    })
      .then((response) => {
        return response.json()
      })
      .then((json) => {
        const jsonFinal = setTitleViewsOrderCategoryOrder(json.hits, jsonDataRows)
        resolve(jsonFinal)
      })
      .catch((error) => {
        _reject(error)
      })
  })
}

export interface MxSdkManager {
  ask: (...args: unknown[]) => Promise<unknown>
  on: (event: string, cb: () => void) => void
}

function sdkManager(container: HTMLElement): Promise<MxSdkManager> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mxsdkGlobal = (window as unknown as { mxsdk: any }).mxsdk
    const manager = new mxsdkGlobal.Manager({
      container: container,
      url: `https://app.${HOST}`,
      static: true,
      verbose: false,
      params: {
        closePanels: true,
        theme: 'water_light',
        lat: 37.362,
        lng: 16.549,
        useMaxBounds: false,
        n: 85,
        s: -60,
        e: 180,
        w: -180,
        panels: {
          controls_panel: { show: false },
          notif_panel: { show: false },
        },
      },
    })
    manager.on('ready', () => {
      resolve(manager)
    })
  })
}

function setTitleViewsOrderCategoryOrder(json: MxView[], views1: MxView[]): MxView[] {
  json.forEach((_part, index, dataJson) => {
    const obj = views1.find((o) => o.view_id === dataJson[index].view_id)
    if (typeof obj === 'object') {
      dataJson[index].view_title = obj.view_title
      dataJson[index].order_views = obj.order_views
      dataJson[index].order_cat = obj.order_cat
      dataJson[index].id = obj.id
    }
  })
  return json
}

export { HOST, fetchViewFromJsonFile, apiSearchViewsFetch, sdkManager, fuseCustomJsFetch }