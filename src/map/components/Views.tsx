import { useEffect, useState } from 'react'
import { CopyButton, Button, Checkbox, Input } from '@mantine/core'
import { randomId } from '@mantine/hooks'
import { IconCopy, IconPinnedOff } from '@tabler/icons-react'
import FiltersHeaders, { Filters, SelectedCat, type KeywordConfig } from './Filters'
import View from './View'
import { apiSearchViewsFetch, fetchViewFromJsonFile, fuseCustomJsFetch, type MxView, type MxSdkManager } from '../services/Mapx'
import { useUrlSearchParams } from '../services/Hooks'

import Symbol from './Symbol'
import customLayers from '../data/additional_views.json'

const added: string[] = []
const addedOnce: Record<string, boolean> = {} // Needed to allow the initial app loading case

export default function Views({ mxManager, enableDownloads }: { mxManager: MxSdkManager; enableDownloads?: boolean }) {
  const [freeTextSearch, setFreeTextSearch] = useState('')
  const { mxJson, mxJsonInitial: mxJsonFull, handleFiltersSearchChange } = useMxViews()
  const [KEYWORDS] = useKeywords()

  const listUsp = useUrlSearchParams(function (urlSearchParams) {
    return urlSearchParams.get('list')
  })
  const viewsIdsUsp = useUrlSearchParams(function (urlSearchParams) {
    return urlSearchParams.getAll('view')
  })
  const pinCountUsp = useUrlSearchParams(function (urlSearchParams) {
    return urlSearchParams.getAll('pin').length
  })
  const [keywordsMap, setKeywordsMap] = useState<Map<string, boolean>>(() => {
    const map = new Map<string, boolean>()
    map.set('drought', true)
    map.delete('threats')
    return map
  })
  const [toggledOnly, setToggledOnly] = useState(false)
  const [count, setCount] = useState(0)
  const legendsData: Record<string, string> = {} // legends populated via ask('get_view_legend') when views are themed
  const mxViewsPinnedUsp = useUrlSearchParams(function (urlSearchParams) {
    const mxViews = mxJsonFull ?? []
    return urlSearchParams
      .getAll('pin')
      .map((viewId) => mxViews.find((v) => v.view_id == viewId))
      .filter((r): r is MxView => r !== undefined)
  })
  const toggledUsp = useUrlSearchParams(function (urlSearchParams) {
    return urlSearchParams.getAll('view')
  })
  const views = (mxJson ?? []).filter((view) => (!toggledOnly ? true : toggledUsp.value.includes(view.view_id)))

  const clearCurrentPinned = () => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete('pin')
    history.pushState({}, '', '?' + params.toString())
  }
  const clearCurrentViews = () => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    params.delete('view')
    history.pushState({}, '', '?' + params.toString())
  }

  const clearAllFilters = () => {
    setKeywordsMap(new Map())
    setFreeTextSearch('')
    setToggledOnly(false)
  }

  useEffect(() => {
    // Handle search changes (which need API fetch)
    void (async () => {
      const json = await handleFiltersSearchChange({
        freeTextSearch: freeTextSearch,
        keywords: Array.from(keywordsMap.keys()),
        context: 'explore',
      })
      let c = json.length
      if (toggledOnly) {
        c = json.filter((v) => toggledUsp.value.includes(v.view_id)).length
      }
      setCount(c)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeTextSearch, keywordsMap, toggledOnly])

  useEffect(() => {
    // Sort compute: sort the view IDs in the workspace
    viewsIdsUsp.value.sort((viewIdA, viewIdB) => {
      const iA = mxViewsPinnedUsp.value.findIndex((view) => view.view_id == viewIdA)
      const iB = mxViewsPinnedUsp.value.findIndex((view) => view.view_id == viewIdB)
      if (iA !== undefined && iB !== undefined) {
        return iA - iB
      }
      return 0
    })

    // Add/Remove view depending on the URL query
    const toAdd = viewsIdsUsp.value.filter((x) => !added.includes(x))
    toAdd.forEach(async (id) => {
      added.push(id)
      addedOnce[id] = true
      await mxManager.ask('view_add', { idView: id })
    })

    const toRemove = added.filter((x) => !viewsIdsUsp.value.includes(x))
    toRemove.forEach(async (id) => {
      added.splice(
        added.findIndex((idb) => idb == id),
        1
      )
      if (addedOnce[id]) {
        await mxManager.ask('view_remove', { idView: id })
      }
    })

    // Apply sort to the map layers
    if (viewsIdsUsp.value.length) {
      void mxManager.ask('set_views_layer_order', { order: viewsIdsUsp.value })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewsIdsUsp.value, mxViewsPinnedUsp.value])

  useEffect(() => {
    if (mxJson && mxJson.length) {
      const url = new URL(window.location.href)
      const params = new URLSearchParams(url.search)
      const existingViews = params.getAll('view')

      // Filter layers marked with default_on: true
      const defaultLayers = mxJson.filter((layer) => layer.default_on)

      let updated = false
      defaultLayers.forEach((layer) => {
        if (!existingViews.includes(layer.view_id)) {
          params.append('view', layer.view_id)
          updated = true
        }
      })

      if (updated) {
        history.replaceState({}, '', '?' + params.toString())
      }
    }
  }, [mxJson])

  const movePinned = (index: number, dir: number) => {
    const target = index + dir
    const arr = [...mxViewsPinnedUsp.value]
    if (target < 0 || target >= arr.length) return
    const [it] = arr.splice(index, 1)
    arr.splice(target, 0, it)
    const params = new URLSearchParams(window.location.search)
    params.delete('pin')
    arr.forEach((v) => params.append('pin', v.view_id))
    history.pushState({}, '', '?' + params.toString())
  }

  const isExplore = !listUsp.value || listUsp.value == 'explore'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FiltersHeaders setToggledOnly={setToggledOnly} listUsp={listUsp} count={count} />

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {isExplore && (
          <>
            {/* Free text search */}
            <div className="px-4 pt-4">
              <Input
                className="free-text-search"
                leftSection={<Symbol value="search" />}
                type="text"
                radius="md"
                placeholder="Free text search"
                value={freeTextSearch}
                onChange={({ target }) => setFreeTextSearch(target.value)}
              />
            </div>

            {/* Filter management */}
            <div className="mx-4 my-3 rounded-lg border border-gray-200 bg-[#f5f5f5] px-4 py-3">
              <Checkbox
                label="Show only the active layers"
                className="font-semibold text-sm"
                checked={toggledOnly}
                onChange={() => setToggledOnly(!toggledOnly)}
              />
              <div className="flex items-center pt-1">
                <Symbol value="wrong_location" className="text-sm font-semibold align-middle" />
                <button
                  className="pl-2 text-sm font-semibold underline underline-offset-4"
                  onClick={clearCurrentViews}
                >
                  Remove all active layers
                </button>
              </div>
              {keywordsMap.size > 0 && (
                <div className="mt-2 border-t border-gray-200 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {Array.from(keywordsMap).map(([key]) => (
                      <SelectedCat
                        key={key}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        onClose={() => {
                          const next = new Map(keywordsMap)
                          next.delete(key)
                          setKeywordsMap(next)
                        }}
                      />
                    ))}
                    <div className="flex items-center gap-1">
                      <Symbol value="delete" className="text-sm font-semibold align-middle" />
                      <button
                        className="text-sm font-semibold underline underline-offset-4"
                        onClick={clearAllFilters}
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {isExplore && (
          <div className="filters-list-layout filters-list-layout--explore">
            <Filters
              KEYWORDS={KEYWORDS}
              handleSearchChange={handleFiltersSearchChange}
              toggledOnly={toggledOnly}
              setCount={setCount}
              keywordsMap={keywordsMap}
              setKeywordsMap={setKeywordsMap}
              freeTextSearch={freeTextSearch}
            />

            <div className="explore-list px-2 pb-6 pt-4">
              {!views.length && <div className="m-5 text-center">Your search returned no results...</div>}
              {views.map((view) => (
                <View
                  key={view.view_id}
                  view={view}
                  mxManager={mxManager}
                  legends={legendsData}
                  isDraggable={false}
                  enableDownloads={enableDownloads}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pinned list */}
        {listUsp.value === 'pinned' && (
          <div className="px-4 pb-6">
            {!pinCountUsp.value && (
              <div className="m-5 text-center">
                None; select some from sections <em>Explore</em>...
              </div>
            )}
            {pinCountUsp.value > 0 && (
              <div className="workspace-button flex justify-between border-b py-4">
                <CopyButton value={window.location.href}>
                  {({ copied, copy }) => (
                    <Button
                      leftSection={<IconCopy size={16} />}
                      className="font-semibold text-sm bg-green"
                      color={copied ? 'blue' : 'green'}
                      onClick={copy}
                    >
                      {copied ? 'Workspace copied' : 'Get your Workspace'}
                    </Button>
                  )}
                </CopyButton>
                <Button
                  leftSection={<IconPinnedOff size={18} />}
                  className="font-semibold text-sm bg-green"
                  color="red"
                  onClick={clearCurrentPinned}
                >
                  Remove all pinned layers
                </Button>
              </div>
            )}

            {mxViewsPinnedUsp.value.map((view, index) => (
              <View
                key={view.view_id}
                view={view}
                mxManager={mxManager}
                isDraggable
                onMoveUp={() => movePinned(index, -1)}
                onMoveDown={() => movePinned(index, 1)}
                legends={legendsData}
                enableDownloads={enableDownloads}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function useMxViews(): {
  mxJson: MxView[] | null
  mxJsonInitial: MxView[] | null
  handleFiltersSearchChange: (args: { keywords: string[]; freeTextSearch: string; context?: string }) => Promise<MxView[]>
} {
  const [mxJson, setMxJson] = useState<MxView[] | null>(null)
  const [mxJsonInitial, setMxJsonInitial] = useState<MxView[] | null>(null)

  const handleFiltersSearchChange = async ({
    keywords,
    freeTextSearch,
  }: {
    keywords: string[]
    freeTextSearch: string
    context?: string
  }) => {
    const keywordsFacetFilters = keywords.length ? keywords.map((k) => `${k}`) : null
    const views1 = await fetchViewFromJsonFile(keywordsFacetFilters)
    const views2 = await apiSearchViewsFetch()
    // Custom layers (can also be imported from a file)
    views2.push(...(customLayers as unknown as MxView[]))
    const views3 = await fuseCustomJsFetch(freeTextSearch)
    let json = getIntersection(views2, views1, views3 as unknown as Array<MxView & { item?: MxView }>)
    json = orderJson(json)
    setMxJson(json)
    return json
  }

  useEffect(() => {
    void (async function () {
      if (mxJsonInitial === null) {
        const views1 = await fetchViewFromJsonFile()
        const views2 = await apiSearchViewsFetch()
        const views3 = await fuseCustomJsFetch('')
        views2.push(...(customLayers as unknown as MxView[]))
        let json = getIntersection(views2, views1, views3 as unknown as Array<MxView & { item?: MxView }>)
        json = orderJson(json)
        setMxJson(json)
        setMxJsonInitial(json)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mxJson])

  return { mxJson: mxJson, mxJsonInitial: mxJsonInitial, handleFiltersSearchChange: handleFiltersSearchChange }
}

function useKeywords(): [KeywordConfig] {
  const KEYWORDS: KeywordConfig = [
    {
      section: 'Category',
      items: [
        {
          label: 'base maps',
          symbol: 'database',
          sub_category: [{ label: 'base maps', symbol: 'database', key: randomId() }],
        },
        {
          label: 'Biophysical',
          symbol: 'group',
          sub_category: [
            { label: 'land status', key: randomId() },
            { label: 'restoration', key: randomId() },
          ],
        },
        {
          label: 'climate data',
          symbol: 'warning',
          sub_category: [{ label: 'climate data', symbol: 'warning', key: randomId() }],
        },
        {
          label: 'socio-economics',
          symbol: 'database',
          sub_category: [
            { label: 'socio-economics', symbol: 'database', key: randomId() },
            { label: 'population', key: randomId() },
          ],
        },
        {
          label: 'Threats',
          symbol: 'group',
          sub_category: [
            { label: 'burned areas', key: randomId() },
            { label: 'Near Real-time Fires', key: randomId() },
            { label: 'drought', key: randomId() },
            { label: 'deforestation', key: randomId() },
          ],
        },
      ],
    },
  ]
  return [KEYWORDS]
}

// arr1 : data from apiSearchFetch
// arr2 : data from json file
// arr3 : result json from fuse
function getIntersection(
  arr1: MxView[],
  arr2: MxView[],
  arr3: Array<MxView & { item?: MxView }>
): MxView[] {
  if (arr2.length === 0) {
    if (arr3.length === 0) {
      return []
    } else if (arr3[0].item) {
      return arr1.filter((item1) => arr3.some((item2) => item2.item?.view_id === item1.view_id))
    } else {
      return arr1.filter((item1) => arr3.some((item2) => item2.view_id === item1.view_id))
    }
  } else {
    if (arr3.length === 0) {
      return []
    } else if (arr3[0].item) {
      const resultCategory = arr2.filter((item1) => arr3.some((item2) => item2.item?.view_id === item1.view_id))
      return arr1.filter((item1) => resultCategory.some((item2) => item2.view_id === item1.view_id))
    } else {
      return arr1.filter((item1) => arr2.some((item2) => item2.view_id === item1.view_id))
    }
  }
}

function orderJson(json: MxView[]): MxView[] {
  json.sort(compareByViewsJsonFileOrderByViews)
  json.sort(compareByViewsJsonFileOrderByCategories)
  return json
}

function compareByViewsJsonFileOrderByViews(a: MxView, b: MxView) {
  return (a.order_views ?? 0) - (b.order_views ?? 0)
}
function compareByViewsJsonFileOrderByCategories(a: MxView, b: MxView) {
  return (a.order_cat ?? 0) - (b.order_cat ?? 0)
}