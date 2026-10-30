<script setup lang="ts">
import { site } from '#shared/data/site'
import { CONTACT_TOPICS, validateContact, type ContactMessage } from '#shared/utils/contact'

defineProps<{ pageTitle?: boolean }>()

const { whatsappNumber } = useRuntimeConfig().public

const form = reactive({
  name: '',
  email: '',
  topic: CONTACT_TOPICS[0] as string,
  message: '',
  website: ''
})
const errors = ref<Partial<Record<keyof ContactMessage, string>>>({})
const status = ref<{ text: string; good: boolean } | null>(null)
const sending = ref(false)
const copied = ref(false)

async function submit() {
  status.value = null
  const result = validateContact(form)
  errors.value = result.ok ? {} : result.errors
  if (!result.ok) return

  sending.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: form })
    status.value = {
      text: "Thanks. Your message is on its way to me, and I'll reply by email.",
      good: true
    }
    form.name = ''
    form.email = ''
    form.message = ''
    track('contact-submit')
  } catch (error) {
    const response = error as { statusMessage?: string; data?: { errors?: typeof errors.value } }
    errors.value = response.data?.errors ?? {}
    status.value = {
      text: response.statusMessage || `Your message wasn't sent. Email ${site.email} instead.`,
      good: false
    }
  } finally {
    sending.value = false
  }
}

async function copyEmail() {
  track('email-copy')
  try {
    await navigator.clipboard.writeText(site.email)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    // Selecting the address gives visitors a way to copy it themselves.
    const selection = getSelection()
    const address = document.getElementById('contact-email')
    if (selection && address) selection.selectAllChildren(address)
  }
}
</script>

<template>
  <section id="contact" aria-labelledby="contact-heading">
    <SectionLabel v-if="!pageTitle">contact</SectionLabel>
    <component :is="pageTitle ? 'h1' : 'p'" id="contact-heading" class="contact-title">
      Tell me what you're building or who you're hiring for.
    </component>
    <div class="contact-grid">
      <form novalidate @submit.prevent="submit">
        <div class="two">
          <div class="field">
            <label for="contact-name">Name</label>
            <input
              id="contact-name"
              v-model="form.name"
              autocomplete="name"
              required
              :aria-invalid="Boolean(errors.name)"
              :aria-describedby="errors.name ? 'contact-name-error' : undefined"
            />
            <p v-if="errors.name" id="contact-name-error" class="field-error">{{ errors.name }}</p>
          </div>
          <div class="field">
            <label for="contact-address">Email</label>
            <input
              id="contact-address"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              :aria-invalid="Boolean(errors.email)"
              :aria-describedby="errors.email ? 'contact-address-error' : undefined"
            />
            <p v-if="errors.email" id="contact-address-error" class="field-error">
              {{ errors.email }}
            </p>
          </div>
        </div>
        <div class="field">
          <label for="contact-topic">This is about</label>
          <select id="contact-topic" v-model="form.topic">
            <option v-for="topic in CONTACT_TOPICS" :key="topic">{{ topic }}</option>
          </select>
        </div>
        <div class="field">
          <label for="contact-message">Message</label>
          <textarea
            id="contact-message"
            v-model="form.message"
            required
            :aria-invalid="Boolean(errors.message)"
            :aria-describedby="errors.message ? 'contact-message-error' : undefined"
          ></textarea>
          <p v-if="errors.message" id="contact-message-error" class="field-error">
            {{ errors.message }}
          </p>
        </div>
        <div class="trap" aria-hidden="true">
          <label for="contact-website">Leave this empty</label>
          <input id="contact-website" v-model="form.website" tabindex="-1" autocomplete="off" />
        </div>
        <p role="status" class="form-status" :class="{ good: status?.good }">{{ status?.text }}</p>
        <button class="btn primary" type="submit" :disabled="sending">
          {{ sending ? 'Sending…' : 'Send message' }}
        </button>
        <p class="note">I use your details only to reply to you.</p>
      </form>

      <div class="direct">
        <div>
          <span class="k mono">email</span>
          <div class="copy-row">
            <span id="contact-email" class="addr">{{ site.email }}</span>
            <button class="ctl" type="button" @click="copyEmail">
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </div>
        </div>
        <div v-if="whatsappNumber">
          <span class="k mono">whatsapp</span>
          <a :href="`https://wa.me/${whatsappNumber}`" @click="track('whatsapp-click')">
            Message me on WhatsApp
          </a>
        </div>
        <div>
          <span class="k mono">elsewhere</span>
          <div class="links">
            <a v-for="link in site.links" :key="link.href" :href="link.href">{{ link.label }}</a>
          </div>
        </div>
        <div>
          <span class="k mono">location</span>
          <span>{{ site.location }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
