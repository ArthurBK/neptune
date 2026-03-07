'use client'

import { useCallback, useRef, useState } from 'react'
import { Card, Flex, Spinner, Text } from '@sanity/ui'
import { insert, PatchEvent, setIfMissing, useClient } from 'sanity'
import { uuid } from '@sanity/uuid'

import type { ArrayOfObjectsInputProps } from 'sanity'

const ACCEPT = 'image/*'

export function GalleryUploadInput(props: ArrayOfObjectsInputProps) {
  const { onChange, renderDefault } = props
  const client = useClient({ apiVersion: '2026-03-06' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState(0)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (fileArray.length === 0) return

      setUploading(true)
      setUploadCount(0)

      const newItems: Array<{
        _key: string
        _type: string
        asset: { _type: 'reference'; _ref: string }
      }> = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        try {
          const asset = await client.assets.upload('image', file, {
            filename: file.name,
          })
          newItems.push({
            _key: uuid(),
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
          })
          setUploadCount(i + 1)
        } catch (err) {
          console.error('Upload failed:', err)
        }
      }

      setUploading(false)

      if (newItems.length > 0) {
        const patches = PatchEvent.from(insert(newItems, 'after', [-1])).prepend(
          setIfMissing([])
        )
        onChange(patches)
      }
    },
    [client, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (uploading) return
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles, uploading]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleClick = useCallback(() => {
    if (uploading) return
    fileInputRef.current?.click()
  }, [uploading])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files?.length) {
        handleFiles(files)
        e.target.value = ''
      }
    },
    [handleFiles]
  )

  return (
    <Flex direction="column" gap={3}>
      {/* Multi-upload dropzone */}
      <Card
        padding={4}
        radius={2}
        tone="transparent"
        style={{
          border: '2px dashed var(--card-border-color)',
          cursor: uploading ? 'wait' : 'pointer',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <Flex align="center" justify="center" gap={3}>
          {uploading ? (
            <>
              <Spinner />
              <Text size={1}>
                Uploading {uploadCount}…
              </Text>
            </>
          ) : (
            <Text size={1} muted>
              Drop multiple images here or click to select
            </Text>
          )}
        </Flex>
      </Card>

      {/* Default array input (grid of existing images) */}
      {renderDefault(props)}
    </Flex>
  )
}
