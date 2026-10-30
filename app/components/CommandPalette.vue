<script setup lang="ts">
import { caseStudies } from '#content/meta'
import { site } from '#shared/data/site'

interface Command {
  label: string
  hint: string
  run: () => void
}

const open = usePalette()
const { toggleTheme } = useTheme()
const router = useRouter()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const input = useTemplateRef<HTMLInputElement>('input')
const query = ref('')
const active = ref(0)

const go = (path: string) => () => router.push(path)

const commands: Command[] = [
  { label: 'Selected work', hint: '/#work', run: go('/#work') },
  ...caseStudies.map((study) => ({
    label: `${study.title} case study`,
    hint: `/work/${study.slug}`,
    run: go(`/work/${study.slug}`)
  })),
  { label: 'Open source', hint: '/open-source', run: go('/open-source') },
  { label: 'Ways to work', hint: '/#ways', run: go('/#ways') },
  { label: 'About and experience', hint: '/#about', run: go('/#about') },
  { label: 'Résumé', hint: '/resume', run: go('/resume') },
  { label: 'Contact', hint: '/#contact', run: go('/#contact') },
  {
    label: 'Copy email address',
    hint: 'copy',
    run: () => {
      navigator.clipboard?.writeText(site.email).catch(() => {})
      track('email-copy')
    }
  },
  { label: 'Switch theme', hint: 'theme', run: toggleTheme }
]

const shown = computed(() => {
  const text = query.value.trim().toLowerCase()
  return commands.filter((command) => command.label.toLowerCase().includes(text))
})

watch(query, () => {
  active.value = 0
})

watch(open, async (isOpen) => {
  if (isOpen) {
    query.value = ''
    active.value = 0
    dialog.value?.showModal()
    await nextTick()
    input.value?.focus()
  } else if (dialog.value?.open) {
    dialog.value.close()
  }
})

function choose(command: Command) {
  open.value = false
  command.run()
}

function onInputKey(event: KeyboardEvent) {
  const count = shown.value.length
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (count) active.value = (active.value + (event.key === 'ArrowDown' ? 1 : count - 1)) % count
  } else if (event.key === 'Enter') {
    event.preventDefault()
    const command = shown.value[active.value]
    if (command) choose(command)
  }
}

function onGlobalKey(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value = true
  }
}

onMounted(() => document.addEventListener('keydown', onGlobalKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onGlobalKey))
</script>

<template>
  <dialog
    ref="dialog"
    class="palette"
    aria-label="Command palette"
    @close="open = false"
    @click="(event) => event.target === dialog && (open = false)"
  >
    <input
      ref="input"
      v-model="query"
      type="text"
      placeholder="Type to jump…"
      aria-label="Filter commands"
      autocomplete="off"
      @keydown="onInputKey"
    />
    <ul role="listbox" aria-label="Commands">
      <li
        v-for="(command, i) in shown"
        :key="command.label"
        role="option"
        :aria-selected="i === active"
        @click="choose(command)"
      >
        {{ command.label }}<span>{{ command.hint }}</span>
      </li>
      <li v-if="shown.length === 0" class="empty">Nothing matches that.</li>
    </ul>
  </dialog>
</template>
