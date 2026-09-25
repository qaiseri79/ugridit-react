import { useEffect, useState } from 'react'
import { Checkbox } from '@mantine/core'
import { useListState } from '@mantine/hooks'
import {
  IconMap,
  IconTrees,
  IconTemperatureSun,
  IconTractor,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { useUrlSearchParams } from '../services/Hooks'

import Symbol from './Symbol'
import classNames from 'classnames'

export default function FiltersHeaders({
  setToggledOnly,
  listUsp,
  count,
}: {
  setToggledOnly: (v: boolean) => void
  listUsp: { value: string | null; urlSearchParams: URLSearchParams }
  count: number
}) {
  void setToggledOnly
  const pinCountUsp = useUrlSearchParams(function (urlSearchParams) {
    return urlSearchParams.getAll('pin').length
  })

  return (
    <>
      {/* Featured/Explore/Pinned switch */}
      <nav className="flex h-11 sticky top-0 bg-white z-10">
        {/* Keywords filters */}
        <button
          className={classNames(
            'explore-count flex-auto',
            !listUsp.value || listUsp.value == 'explore' ? 'bg-green2 text-black' : 'border-secondary border-b-2'
          )}
          onClick={() => {
            listUsp.urlSearchParams.set('list', 'explore')
            history.pushState({}, '', '?' + listUsp.urlSearchParams.toString())
          }}
        >
          <Symbol value="travel_explore" className="font-semibold align-middle" /> Explore ({count})
        </button>
        <button
          className={classNames(
            'own-workspace flex-auto font-semibold',
            listUsp.value == 'pinned' ? 'bg-orange-2 text-white ' : 'border-secondary'
          )}
          onClick={() => {
            listUsp.urlSearchParams.set('list', 'pinned')
            history.pushState({}, '', '?' + listUsp.urlSearchParams.toString())
          }}
        >
          <Symbol value="push_pin" className={classNames('align-middle', { fill: listUsp.value == 'pinned' })} /> My
          Workspace ({pinCountUsp.value})
        </button>
      </nav>
    </>
  )
}

function SelectedCat({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div>
      <button className="block py-2 px-4 bg-soil border w-full rounded-small text-white">
        <span className="float-left">{label}</span>
        <span className="float-right" onClick={() => onClose()}>
          x
        </span>
      </button>
    </div>
  )
}

const CheckboxIconBaseMaps = () => <IconMap size={18} />
const CheckboxIconBiophysical = () => <IconTrees size={18} />
const CheckboxIconThreats = () => <IconAlertTriangle size={18} />
const CheckboxIconClimateData = () => <IconTemperatureSun size={18} />
const CheckboxIconSocioEconomics = () => <IconTractor size={18} />

function Categories({
  KEYWORDS,
  keywordsMap,
  setKeywordsMap,
}: {
  KEYWORDS: KeywordConfig
  keywordsMap: Map<string, boolean>
  setKeywordsMap: (m: Map<string, boolean>) => void
}) {
  const cat1 = KEYWORDS[0].items[0]
  const cat2 = KEYWORDS[0].items[1]
  const cat3 = KEYWORDS[0].items[2]
  const cat4 = KEYWORDS[0].items[3]
  const cat5 = KEYWORDS[0].items[4]

  const [values1, handlers1] = useListState(cat1.sub_category)
  const [values2, handlers2] = useListState(cat2.sub_category)
  const [values3, handlers3] = useListState(cat3.sub_category)
  const [values4, handlers4] = useListState(cat4.sub_category)
  const [values5, handlers5] = useListState(cat5.sub_category)

  const allChecked1 = values1.every((value) => keywordsMap.get(value.label))
  const indeterminate1 = values1.some((value) => keywordsMap.get(value.label)) && !allChecked1

  const allChecked2 = values2.every((value) => keywordsMap.get(value.label))
  const indeterminate2 = values2.some((value) => keywordsMap.get(value.label)) && !allChecked2

  const allChecked3 = values3.every((value) => keywordsMap.get(value.label))
  const indeterminate3 = values3.some((value) => keywordsMap.get(value.label)) && !allChecked3

  const allChecked4 = values4.every((value) => keywordsMap.get(value.label))
  const indeterminate4 = values4.some((value) => keywordsMap.get(value.label)) && !allChecked4

  const allChecked5 = values5.every((value) => keywordsMap.get(value.label))
  const indeterminate5 = values5.some((value) => keywordsMap.get(value.label)) && !allChecked5

  const items1 = values1.map((subcategory, index) => (
    <Checkbox
      className="sub-category"
      label={subcategory.label}
      key={subcategory.key}
      checked={keywordsMap.get(subcategory.label)}
      onChange={(event) => handlers1.setItemProp(index, 'checked', event.currentTarget.checked)}
      onClick={() => {
        const value = subcategory.label
        if (!keywordsMap.delete(value)) keywordsMap.set(value, true)
        setKeywordsMap(new Map(keywordsMap))
      }}
    />
  ))

  const items2 = values2.map((subcategory, index) => (
    <Checkbox
      className="sub-category"
      label={subcategory.label}
      key={subcategory.key}
      checked={keywordsMap.get(subcategory.label)}
      onChange={(event) => handlers2.setItemProp(index, 'checked', event.currentTarget.checked)}
      onClick={() => {
        const value = subcategory.label
        if (!keywordsMap.delete(value)) keywordsMap.set(value, true)
        keywordsMap.delete('biophysical')
        setKeywordsMap(new Map(keywordsMap))
      }}
    />
  ))

  const items3 = values3.map((subcategory, index) => (
    <Checkbox
      className="sub-category"
      label={subcategory.label}
      key={subcategory.key}
      checked={keywordsMap.get(subcategory.label)}
      onChange={(event) => handlers3.setItemProp(index, 'checked', event.currentTarget.checked)}
      onClick={() => {
        const value = subcategory.label
        if (!keywordsMap.delete(value)) keywordsMap.set(value, true)
        setKeywordsMap(new Map(keywordsMap))
      }}
    />
  ))

  const items4 = values4.map((subcategory, index) => (
    <Checkbox
      className="sub-category"
      label={subcategory.label}
      key={subcategory.key}
      checked={keywordsMap.get(subcategory.label)}
      onChange={(event) => handlers4.setItemProp(index, 'checked', event.currentTarget.checked)}
      onClick={() => {
        const value = subcategory.label
        if (!keywordsMap.delete(value)) keywordsMap.set(value, true)
        setKeywordsMap(new Map(keywordsMap))
      }}
    />
  ))

  const items5 = values5.map((subcategory, index) => (
    <Checkbox
      className="sub-category"
      label={subcategory.label}
      key={subcategory.key}
      checked={keywordsMap.get(subcategory.label)}
      onChange={(event) => handlers5.setItemProp(index, 'checked', event.currentTarget.checked)}
      onClick={() => {
        const value = subcategory.label
        if (!keywordsMap.delete(value)) keywordsMap.set(value, true)
        keywordsMap.delete('threats')
        setKeywordsMap(new Map(keywordsMap))
      }}
    />
  ))

  return (
    <div className="category">
      <div className="category-1">
        <Checkbox
          icon={CheckboxIconBaseMaps}
          className="parent-category"
          checked={allChecked1}
          indeterminate={indeterminate1}
          label="Base maps"
          onChange={() => handlers1.setState((current) => current.map((value) => ({ ...value, checked: !allChecked1 })))}
          onClick={() => {
            const value = 'base maps'
            if (!keywordsMap.delete(value)) keywordsMap.set(value, true)
            setKeywordsMap(new Map(keywordsMap))
          }}
        />
        <div className="sub-categories">{items1}</div>
      </div>

      <div className="category-2">
        <Checkbox
          icon={CheckboxIconThreats}
          className="parent-category"
          checked={allChecked5}
          indeterminate={indeterminate5}
          label="Threats"
          onChange={() => handlers5.setState((current) => current.map((value) => ({ ...value, checked: !allChecked5 })))}
          onClick={() => {
            const value = 'threats'
            let threatsExist = false
            const threatsCategories = ['threats', 'burned areas', 'deforestation', 'drought', 'near real-time fires']

            if (!keywordsMap.delete(value)) {
              threatsCategories.forEach((v) => keywordsMap.set(v, true))
            }

            keywordsMap.forEach((_v, key) => {
              if ('threats' === key) {
                threatsExist = true
              }
            })

            if (!threatsExist) {
              keywordsMap.clear()
            }
            setKeywordsMap(new Map(keywordsMap))
          }}
        />
        <div className="sub-categories">{items5}</div>
      </div>
      <div className="category-3">
        <Checkbox
          icon={CheckboxIconBiophysical}
          className="parent-category"
          checked={allChecked2}
          indeterminate={indeterminate2}
          label="Biophysical"
          onChange={() => handlers2.setState((current) => current.map((value) => ({ ...value, checked: !allChecked2 })))}
          onClick={() => {
            const value = 'biophysical'
            let biophysicalExist = false
            const biophysicalCategories = ['biophysical', 'land status', 'restoration']

            if (!keywordsMap.delete(value)) {
              biophysicalCategories.forEach((v) => keywordsMap.set(v, true))
            }

            keywordsMap.forEach((_v, key) => {
              if ('biophysical' === key) {
                biophysicalExist = true
              }
            })

            if (!biophysicalExist) {
              keywordsMap.clear()
            }
            setKeywordsMap(new Map(keywordsMap))
          }}
        />
        <div className="sub-categories">{items2}</div>
      </div>
      <div className="category-4">
        <Checkbox
          icon={CheckboxIconClimateData}
          className="parent-category"
          checked={allChecked3}
          indeterminate={indeterminate3}
          label="Climate data"
          onChange={() => handlers3.setState((current) => current.map((value) => ({ ...value, checked: !allChecked3 })))}
          onClick={() => {
            const value = 'climate data'
            if (!keywordsMap.delete(value)) keywordsMap.set(value, true)
            setKeywordsMap(new Map(keywordsMap))
          }}
        />
        <div className="sub-categories">{items3}</div>
      </div>

      <div className="category-5">
        <Checkbox
          icon={CheckboxIconSocioEconomics}
          className="parent-category"
          checked={allChecked4}
          indeterminate={indeterminate4}
          label="Socio-economics"
          onChange={() => handlers4.setState((current) => current.map((value) => ({ ...value, checked: !allChecked4 })))}
          onClick={() => {
            const value = 'socio-economics'
            if (!keywordsMap.delete(value)) keywordsMap.set(value, true)
            setKeywordsMap(new Map(keywordsMap))
          }}
        />
        <div className="sub-categories">{items4}</div>
      </div>
    </div>
  )
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

interface SubCategory {
  label: string
  symbol?: string
  key: string
  checked?: boolean
}

interface KeywordCategory {
  section: string
  items: {
    label: string
    symbol?: string
    sub_category: SubCategory[]
  }[]
}

export type KeywordConfig = KeywordCategory[]

export function Filters({
  KEYWORDS,
  handleSearchChange,
  toggledOnly,
  setToggledOnly,
  listUsp,
  setCount,
  keywordsMap,
  setKeywordsMap,
  freeTextSearch,
  setFreeTextSearch,
}: {
  KEYWORDS: KeywordConfig
  handleSearchChange: (args: { freeTextSearch: string; keywords: string[]; context: string }) => Promise<unknown[]>
  toggledOnly: boolean
  setToggledOnly: (v: boolean) => void
  listUsp: { value: string | null; urlSearchParams: URLSearchParams }
  setCount: (n: number) => void
  keywordsMap: Map<string, boolean>
  setKeywordsMap: (m: Map<string, boolean>) => void
  freeTextSearch: string
  setFreeTextSearch: (v: string) => void
}) {
  const [categoriesFilter] = useState(true)
  const toggledUsp = useUrlSearchParams(function (urlSearchParams) {
    return urlSearchParams.getAll('view')
  })

  useEffect(() => {
    // Handle search changes (which need api fetch)
    void (async () => {
      const json = await handleSearchChange({
        freeTextSearch: freeTextSearch,
        keywords: Array.from(keywordsMap.keys()),
        context: 'explore',
      })
      let count = json.length
      if (toggledOnly) {
        count = json.filter((v) => toggledUsp.value.includes((v as { view_id: string }).view_id)).length
      }
      setCount(count)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freeTextSearch, keywordsMap, toggledOnly])

  const handleClear = () => {
    setKeywordsMap(new Map())
    setFreeTextSearch('')
    setToggledOnly(false)
  }

  return (
    <>
      {/* Featured/Explore/Pinned switch */}
      {(!listUsp.value || listUsp.value == 'explore') && listUsp.value != 'pinned' && categoriesFilter && (
        <div className="hidden md:flex flex-col bg-white w-60 overflow-y-auto border-r border-gray1">
          <div>
            <div className="px-0 h-app-mobile md:h-app">
              <div className="">
                <div className="px-3">
                  <label className="flex my-3 text-sm font-extrabold">Filters</label>
                </div>
              </div>
              <div className="flex">
                <ul className="w-full">
                  {Array.from(keywordsMap).map((item) => (
                    <li className="w-full px-2.5" key={item[0]}>
                      <SelectedCat
                        label={capitalizeFirstLetter(item[0])}
                        onClose={function () {
                          keywordsMap.delete(item[0])
                          setKeywordsMap(new Map(keywordsMap))
                        }}
                      ></SelectedCat>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end">
                <Symbol value="delete" className="font-semibold align-middle py-2" />
                <button className="px-2 font-semibold text-sm underline-offset-4 underline" onClick={handleClear}>
                  Clear all
                </button>
              </div>
              <div className="mb-3">
                <div className="flex mt-5 flex-col">
                  <Categories KEYWORDS={KEYWORDS} keywordsMap={keywordsMap} setKeywordsMap={setKeywordsMap} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}