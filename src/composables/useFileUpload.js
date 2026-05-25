import { ref, onUnmounted } from 'vue'

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * @param {Object} options
 * @param {number} [options.maxFiles] - Only used when multiple is true, defaults to Infinity
 * @param {number} [options.maxSize] - in bytes
 * @param {string} [options.accept]
 * @param {boolean} [options.multiple]
 * @param {Array<{name:string,size:number,type:string,url:string,id:string}>} [options.initialFiles]
 * @param {Function} [options.onFilesChange]
 * @param {Function} [options.onFilesAdded]
 */
export function useFileUpload(options = {}) {
  const {
    maxFiles = Infinity,
    maxSize = Infinity,
    accept = '*',
    multiple = false,
    initialFiles = [],
    onFilesChange,
    onFilesAdded,
  } = options

  const files = ref(
    initialFiles.map((file) => ({
      file,
      id: file.id,
      preview: file.url,
    })),
  )
  const isDragging = ref(false)
  const errors = ref([])
  const inputRef = ref(null)

  const validateFile = (file) => {
    const fileSize = file instanceof File ? file.size : file.size
    if (fileSize > maxSize) {
      return `文件 "${file.name}" 超出最大限制 ${formatBytes(maxSize)}。`
    }

    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map((type) => type.trim())
      const fileType = file instanceof File ? file.type || '' : file.type
      const fileExtension = `.${(file instanceof File ? file.name : file.name).split('.').pop()}`

      const isAccepted = acceptedTypes.some((type) => {
        if (type.startsWith('.')) {
          return fileExtension.toLowerCase() === type.toLowerCase()
        }
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0]
          return fileType.startsWith(`${baseType}/`)
        }
        return fileType === type
      })

      if (!isAccepted) {
        return `文件 "${file instanceof File ? file.name : file.name}" 不是允许的类型。`
      }
    }

    return null
  }

  const createPreview = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file)
    }
    return file.url
  }

  const generateUniqueId = (file) => {
    if (file instanceof File) {
      return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
    return file.id
  }

  const clearFiles = () => {
    files.value.forEach((f) => {
      if (f.preview && f.file instanceof File && f.file.type.startsWith('image/')) {
        URL.revokeObjectURL(f.preview)
      }
    })

    if (inputRef.value) {
      inputRef.value.value = ''
    }

    files.value = []
    errors.value = []
    onFilesChange?.(files.value)
  }

  const addFiles = (newFiles) => {
    if (!newFiles || newFiles.length === 0) return

    const newFilesArray = Array.from(newFiles)
    const newErrors = []

    if (!multiple) {
      clearFiles()
    }

    if (multiple && maxFiles !== Infinity && files.value.length + newFilesArray.length > maxFiles) {
      newErrors.push(`最多只能上传 ${maxFiles} 个文件。`)
      errors.value = newErrors
      return
    }

    const validFiles = []

    newFilesArray.forEach((file) => {
      if (multiple) {
        const isDuplicate = files.value.some(
          (existing) => existing.file.name === file.name && existing.file.size === file.size,
        )
        if (isDuplicate) return
      }

      if (file.size > maxSize) {
        newErrors.push(
          multiple
            ? `部分文件超出最大限制 ${formatBytes(maxSize)}。`
            : `文件超出最大限制 ${formatBytes(maxSize)}。`,
        )
        return
      }

      const error = validateFile(file)
      if (error) {
        newErrors.push(error)
      } else {
        validFiles.push({
          file,
          id: generateUniqueId(file),
          preview: createPreview(file),
        })
      }
    })

    if (validFiles.length > 0) {
      onFilesAdded?.(validFiles)

      files.value = !multiple ? validFiles : [...files.value, ...validFiles]
      errors.value = newErrors
      onFilesChange?.(files.value)
    } else if (newErrors.length > 0) {
      errors.value = newErrors
    }

    if (inputRef.value) {
      inputRef.value.value = ''
    }
  }

  const removeFile = (id) => {
    const fileToRemove = files.value.find((f) => f.id === id)
    if (
      fileToRemove &&
      fileToRemove.preview &&
      fileToRemove.file instanceof File &&
      fileToRemove.file.type.startsWith('image/')
    ) {
      URL.revokeObjectURL(fileToRemove.preview)
    }

    files.value = files.value.filter((f) => f.id !== id)
    errors.value = []
    onFilesChange?.(files.value)
  }

  const clearErrors = () => {
    errors.value = []
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = true
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget)) return
    isDragging.value = false
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false

    if (inputRef.value?.disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (!multiple) {
        addFiles([e.dataTransfer.files[0]])
      } else {
        addFiles(e.dataTransfer.files)
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
  }

  const openFileDialog = () => {
    inputRef.value?.click()
  }

  const getInputProps = (props = {}) => ({
    ...props,
    type: 'file',
    onChange: handleFileChange,
    accept: props.accept || accept,
    multiple: props.multiple !== undefined ? props.multiple : multiple,
    ref: inputRef,
  })

  onUnmounted(() => {
    files.value.forEach((f) => {
      if (f.preview && f.file instanceof File && f.file.type.startsWith('image/')) {
        URL.revokeObjectURL(f.preview)
      }
    })
  })

  return {
    files,
    isDragging,
    errors,
    inputRef,
    addFiles,
    removeFile,
    clearFiles,
    clearErrors,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileChange,
    openFileDialog,
    getInputProps,
    formatBytes,
  }
}
