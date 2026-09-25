import { useEffect, useState } from 'react'
import { Spoiler } from '@mantine/core'
import type { MxView, MxSdkManager } from '../services/Mapx'

import DateStr from './DateStr'

export default function Metadata({ view, mxManager }: { view: MxView; mxManager: MxSdkManager }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metadata, setMetadata] = useState<any | null>(null)

  useEffect(() => {
    void (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let meta: any = await mxManager.ask('get_view_source_meta', { idView: view.view_id })
      if (!meta) {
        // 'get_view_source_meta' needs the view to have been added once...
        await mxManager.ask('view_add', { idView: view.view_id })
        await mxManager.ask('view_remove', { idView: view.view_id })
        meta = await mxManager.ask('get_view_source_meta', { idView: view.view_id })
      }
      setMetadata(meta ?? {})
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <h2>{view.view_title}</h2>
      <div>
        <Spoiler maxHeight={120} showLabel="Read more" hideLabel="Read less">
          {view.view_abstract}
        </Spoiler>
      </div>
      <div>
        <h3>Id</h3>
        <p>{view.view_id}</p>
      </div>
      {view.source_note && (
        <>
          <h3>Notes</h3>
          <div>
            <Spoiler maxHeight={120} showLabel="Read more" hideLabel="Read less">
              {view.source_note}
            </Spoiler>
          </div>
        </>
      )}
      <h3>Keywords</h3>
      <p>{(metadata?.text?.keywords?.keys ?? []).join(', ')}</p>
      <h3>Release date</h3>
      <p>
        <DateStr ts={view.source_released_at ? view.source_released_at * 1000 : null} />
      </p>
      <h3>Source homepage</h3>
      <p>{metadata?.origin?.homepage?.url ?? 'None'}</p>
    </>
  )
}