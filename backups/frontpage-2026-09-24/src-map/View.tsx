import { useEffect, useState } from 'react'
import { UnstyledButton, Slider, Modal, Alert } from '@mantine/core'
import classNames from 'classnames'

import Symbol from './Symbol'
import { useUrlSearchParams } from '../services/Hooks'
import DatasetDownloadForm from './DatasetDownloadForm'
import Metadata from './Metadata'
import type { MxSdkManager, MxView } from '../services/Mapx'

const addedOnce: Record<string, boolean> = {} // Take care of initial app loading case

export default function View({
  view,
  mxManager,
  isDraggable,
  legends,
  onMoveUp,
  onMoveDown,
  enableDownloads,
}: {
  view: MxView
  mxManager: MxSdkManager
  isDraggable: boolean
  legends: Record<string, string>
  onMoveUp?: () => void
  onMoveDown?: () => void
  enableDownloads?: boolean
}) {
  const toggleUsp = useUrlSearchParams(function (urlSearchParams) {
    return urlSearchParams.getAll('view').includes(view.view_id)
  })
  const pinUsp = useUrlSearchParams(function (urlSearchParams) {
    return urlSearchParams.getAll('pin').includes(view.view_id)
  })
  const [openTitle, setOpenTitle] = useState(false)
  const [openMetadata, setOpenMetadata] = useState(false)
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)
  const [viewOpacity, setViewOpacity] = useState(1)
  const [datasetExists, setDatasetExists] = useState(false)

  useEffect(() => {
    // Take care initial app loading case: don't remove a view which has never been added...
    if (!toggleUsp.value && !addedOnce[view.view_id]) {
      return
    } else if (toggleUsp.value) {
      addedOnce[view.view_id] = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleUsp.value, openTitle])

  useEffect(() => {
    void (async () => {
      if (openTitle && !datasetExists && enableDownloads) {
        const response = await fetch(`/dataset-exists/${view.view_id}`, { cache: 'no-cache' })
        if (response.status == 200) {
          setDatasetExists(true)
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTitle])

  return (
    <div className={classNames('border-b border-secondary py-3')}>
      <div className="flex items-center">
        {/* Reorder buttons (replaces drag-and-drop) */}
        {isDraggable && (
          <div className="flex flex-col pl-2.5">
            <UnstyledButton onClick={onMoveUp} disabled={!onMoveUp} aria-label="Move up">
              <Symbol value="arrow_drop_up" className="" />
            </UnstyledButton>
            <UnstyledButton onClick={onMoveDown} disabled={!onMoveDown} aria-label="Move down">
              <Symbol value="arrow_drop_down" className="" />
            </UnstyledButton>
          </div>
        )}
        <div className="flex flex-col w-full">
          <div className="flex flex-row w-full">
            {/* Map view visibility switch */}
            <UnstyledButton
              className={classNames('pr-2')}
              onClick={() => {
                // Toggle url view parameters
                const action = !toggleUsp.value ? 'append' : 'remove'
                toggleUsp.urlSearchParams[action]('view', view.view_id)
                history.pushState({}, '', '?' + toggleUsp.urlSearchParams.toString())
              }}
            >
              <Symbol
                className={toggleUsp.value ? 'toggle_on fill' : 'toggle_off'}
                value={toggleUsp.value ? 'toggle_on' : 'toggle_off'}
              />
            </UnstyledButton>
            {/* Title */}
            <div
              className="flex-grow cursor-pointer hover:underline flex justify-start items-center"
              onClick={() => setOpenTitle((b) => !b)}
            >
              {view.view_title}
            </div>
          </div>

          <div className="flex flex-row pr-2.5">
            {/* Pin switch */}
            <UnstyledButton
              className={classNames('pl-2.5 pt-2')}
              onClick={() => {
                // Toggle url pin parameters
                const action = !pinUsp.value ? 'append' : 'remove'
                pinUsp.urlSearchParams[action]('pin', view.view_id)
                history.pushState({}, '', '?' + pinUsp.urlSearchParams.toString())
              }}
            >
              <Symbol value="push_pin" className={pinUsp.value ? 'fill push_pin' : ''} />
            </UnstyledButton>

            {/* Metadata switch */}
            <UnstyledButton className={classNames('pl-2.5 pt-2')} onClick={() => setOpenMetadata((b) => !b)}>
              <Symbol value="info" className={openMetadata ? 'fill' : ''} />
            </UnstyledButton>
          </div>
        </div>
      </div>

      {openTitle && (
        <div className="mt-1 flex items-center space-x-4 pb-1 text-sm text-light break-word">
          <div className="flex grow flex-row">
            <div className="mt-5 basis-3/4">
              {toggleUsp.value && legends[view.view_id] && (
                <div>
                  <label>Legend</label>
                  <img src={legends[view.view_id]} style={{ maxHeight: 180 }} alt="Legend" />
                </div>
              )}
              {toggleUsp.value && (
                <div>
                  <label>Opacity</label>
                  <Slider
                    label={(v) => `${v}%`}
                    onChange={(opacity: number) => {
                      void mxManager.ask('set_view_layer_transparency', {
                        idView: view.view_id,
                        value: opacity / 100,
                      })
                      setViewOpacity(opacity / 100)
                    }}
                    defaultValue={viewOpacity * 100}
                    min={0}
                    max={100}
                  />
                </div>
              )}
            </div>
            <div className="mt-9 basis-1/4">
              <div>
                <a
                  className="pl-2 flex items-end space-x-1 cursor-pointer"
                  target="_blank"
                  onClick={() => {
                    void (async () => {
                      // Modal share needs the view to have been added once (as of ~sept-2023)
                      const toggledInitially = toggleUsp.value
                      if (!toggledInitially) {
                        await mxManager.ask('view_add', { idView: view.view_id })
                      }
                      void mxManager.ask('show_modal_share', { idView: view.view_id })
                      if (!toggledInitially) {
                        void mxManager.ask('view_remove', { idView: view.view_id })
                      }
                    })()
                  }}
                >
                  <Symbol value="share" className="mr-1" />
                  Share
                </a>
              </div>
              {datasetExists && enableDownloads && (
                <div>
                  <a
                    className="flex items-center space-x-1"
                    target="_blank"
                    href={'#'}
                    onClick={(e) => {
                      e.preventDefault()
                      setOpenDownloadDialog((b) => !b)
                    }}
                  >
                    <Symbol value="download" className="mr-1" />
                    Download dataset
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        size="50%"
        opened={openMetadata}
        onClose={() => setOpenMetadata(false)}
        title={<h1 className="text-h1">Metadata</h1>}
      >
        <Metadata view={view} mxManager={mxManager} />
      </Modal>

      <Modal
        size="50%"
        opened={openDownloadDialog}
        onClose={() => setOpenDownloadDialog(false)}
        title="Dataset download"
      >
        <DatasetDownloadForm
          view={view}
          setOpenDownloadDialog={setOpenDownloadDialog}
          setDownloadSuccess={setDownloadSuccess}
        />
      </Modal>

      {downloadSuccess && (
        <Alert
          title="Dataset download"
          color="green"
          withCloseButton
          closeButtonLabel="Close"
          onClose={() => setDownloadSuccess(null)}
        >
          Your download as '{downloadSuccess}' should have started or may have already finished...
        </Alert>
      )}
    </div>
  )
}