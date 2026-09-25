import { useEffect, useState } from 'react'
import { TextInput, Checkbox, Select, Button, Group, Textarea, Modal } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { MxView } from '../services/Mapx'

export default function DatasetDownloadForm({
  view,
  setOpenDownloadDialog,
  setDownloadSuccess,
}: {
  view: MxView
  setOpenDownloadDialog: (open: boolean) => void
  setDownloadSuccess: (filename: string | null) => void
}) {
  const [reasonOfUse, setReasonOfUse] = useState<string | null>(null)
  const [termTexts, setTermTexts] = useState({
    disclaimer: '...',
    license: '...',
  })
  const [termOpenDisclaimer, setTermOpenDisclaimer] = useState(false)
  const [termOpenLicense, setTermOpenLicense] = useState(false)
  const reasonsOfUse = [
    'Disaster Response',
    'Insurance and Risk Management',
    'Emergency Planning',
    'Land-Use Planning',
    'Climate Change Adaptation',
    'Infrastructure Resilience',
    'Ecosystem Services Mapping',
    'Health and Disease Mapping',
    'Community Awareness and Education',
    'Academic and teaching',
    'Other',
  ]
  const form = useForm({
    initialValues: {
      webform_id: 'subscribe_for_download_data',
      mapx_view_id: view.view_id,
      terms_of_service: false,
      terms_of_service_01: false,
      organisation: '',
      email: '',
      reason_of_use: '',
      message: '',
      api: true,
    },

    validate: {
      terms_of_service: (value) => (value ? null : 'You must agree to the terms of disclaimer'),
      terms_of_service_01: (value) => (value ? null : 'You must agree to the terms of license'),
      email: (value) => (!value.trim() || /^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      reason_of_use: (value) => (reasonsOfUse.includes(value) ? null : 'You must pick one'),
    },
  })

  useEffect(() => {
    void (async function () {
      const response = await fetch('/form/subscribe-for-download-data')
      const html = await response.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      setTermTexts({
        disclaimer: doc.querySelectorAll('.webform-terms-of-service-details--content')[0].textContent ?? '',
        license: doc.querySelectorAll('.webform-terms-of-service-details--content')[1].textContent ?? '',
      })
    })()
  }, [])

  return (
    <>
      <p>Please fill the required field in order to download the data.</p>
      <form
        onSubmit={form.onSubmit(async (values) => {
          const r = await fetch('/session/token')
          const sessionToken = await r.text()
          let filename: string
          fetch('/dataset_rest/submit', {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': sessionToken,
            },
          })
            .then((res) => {
              const header = res.headers.get('Content-Disposition')
              const parts = header ? header.split(';') : []
              filename = parts[1] ? parts[1].split('=')[1].replaceAll('"', '') : 'download'
              return res.blob()
            })
            .then((blob) => {
              const a = document.createElement('a')
              a.href = window.URL.createObjectURL(blob)
              a.download = filename
              a.click()
              a.remove()
              setOpenDownloadDialog(false)
              setDownloadSuccess(filename)
            })
        })}
      >
        <Checkbox
          required
          label={
            <>
              I agree to the{' '}
              <a
                className="underline"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setTermOpenDisclaimer(true)
                }}
              >
                terms of disclaimer
                <Modal
                  size="80%"
                  opened={Boolean(termOpenDisclaimer)}
                  onClose={() => setTermOpenDisclaimer(false)}
                  title="Terms of disclaimer"
                >
                  {termTexts.disclaimer}
                </Modal>
              </a>
              .
            </>
          }
          {...form.getInputProps('terms_of_service', { type: 'checkbox' })}
        />
        <Checkbox
          required
          label={
            <>
              I agree to the{' '}
              <a
                className="underline"
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setTermOpenLicense(true)
                }}
              >
                terms of license
                <Modal
                  size="80%"
                  opened={Boolean(termOpenLicense)}
                  onClose={() => setTermOpenLicense(false)}
                  title="Terms of license"
                >
                  {termTexts.license}
                </Modal>
              </a>
              .
            </>
          }
          {...form.getInputProps('terms_of_service_01', { type: 'checkbox' })}
        />
        <TextInput required label="Your Organisation" placeholder="Your Organisation" {...form.getInputProps('organisation')} />
        <TextInput label="Your Email (optional)" placeholder="your@email.com" {...form.getInputProps('email')} />
        <Select
          required
          label="Reason of use"
          placeholder="Pick one"
          classNames={{ input: 'box-border' }}
          data={reasonsOfUse.map((r) => ({ value: r, label: r }))}
          value={form.values.reason_of_use || null}
          onChange={(value) => {
            form.setFieldValue('reason_of_use', value ?? '')
            setReasonOfUse(value)
          }}
        />
        {reasonOfUse == 'Other' && (
          <Textarea
            placeholder="Your comment"
            label="Please give the Reason"
            {...form.getInputProps('please_give_the_reason')}
          ></Textarea>
        )}
        <Group justify="flex-end" mt="md">
          <Button
            className="bg-transparent hover:bg-gray-4 border rounded border-gray-2 text-gray-2"
            onClick={() => setOpenDownloadDialog(false)}
          >
            Close
          </Button>
          <Button className="bg-blue" type="submit">
            Download
          </Button>
        </Group>
      </form>
    </>
  )
}