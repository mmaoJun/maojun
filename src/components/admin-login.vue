<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../utils/api'
import { setAuth } from '../utils/auth'
import TextRotate from './ui/TextRotate.vue'

const router = useRouter()
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const form = reactive({
  username: '',
  password: '',
})

const submitLogin = async () => {
  errorMessage.value = ''
  if (!form.username.trim() || !form.password.trim()) {
    errorMessage.value = 'Please enter username and password'
    return
  }

  loading.value = true
  try {
    const { data } = await api.post('/auth/login', form)
    setAuth(data.data)
    router.push('/manage-images')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Login failed, please try again'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <p class="login-header-text">
      <span>Make it </span>
      <TextRotate
        :texts="['work!', 'fancy ✽', 'right', 'fast', 'fun', 'rock', '🕶️🕶️🕶️']"
        stagger-from="last"
        :stagger-duration="25"
        :rotation-interval="2000"
      />
    </p>
    <div class="login-card">
      <!-- Left Panel: Image -->
      <div class="login-card__image">
        <button class="login-card__back-btn" @click="router.push('/')" title="Back to site">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <img src="/Merlegoll ilustration.jpg" alt="" />
      </div>

      <!-- Right Panel: Form -->
      <div class="login-card__form">
        <div class="login-card__header">
          <h1>
            Welcome Dear maojun
            <svg class="cute-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </h1>
        </div>

        <form class="login-form" @submit.prevent="submitLogin">
          <div class="login-form__field">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="Enter username"
              autocomplete="username"
            />
          </div>

          <div class="login-form__field">
            <label for="password">Password</label>
            <div class="login-form__password-wrap">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password"
                autocomplete="current-password"
              />
              <button type="button" class="login-form__eye" @click="showPassword = !showPassword">
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <p v-if="errorMessage" class="login-form__error">{{ errorMessage }}</p>

          <button type="submit" class="login-form__submit" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  gap: 2rem;
  background: #fff;
}

.login-header-text {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  font-size: clamp(1.75rem, 4.5vw, 3rem);
  font-weight: 300;
  color: #111827;
  margin: 0;
  line-height: 1.4;
}

.login-header-text :deep(.text-rotate) {
  padding: 0.1em 0.35em;
  background: #fa5c2f;
  color: #fff;
  border-radius: 0.5rem;
  margin-left: 0.15em;
}

.login-card {
  width: min(100%, 64rem);
  display: flex;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%), 0 8px 32px rgb(0 0 0 / 8%);
  border: 1px solid rgb(0 0 0 / 6%);
  overflow: hidden;
}

/* ---- Left: Image Panel ---- */
.login-card__image {
  flex: 1;
  position: relative;
  display: none;
}

.login-card__back-btn {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 10;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: rgb(0 0 0 / 22%);
  backdrop-filter: blur(6px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transition: background 0.2s;
}

.login-card__back-btn:hover {
  background: rgb(0 0 0 / 35%);
  transform: none;
  filter: none;
}

.login-card__back-btn svg {
  width: 1.2rem;
  height: 1.2rem;
}

.login-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}

/* ---- Right: Form Panel ---- */
.login-card__form {
  flex: 1;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-card__header {
  margin-bottom: 1.5rem;
}

.login-card__header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cute-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #22c55e;
  flex-shrink: 0;
  animation: heartbeat 1.2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.15); }
  50% { transform: scale(1); }
  75% { transform: scale(1.1); }
}

/* ---- Form ---- */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.login-form__field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.login-form__field input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  background: #fff;
  color: #111827;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.login-form__field input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37 99 235 / 12%);
}

.login-form__field input::placeholder {
  color: #9ca3af;
}

.login-form__password-wrap {
  position: relative;
}

.login-form__password-wrap input {
  padding-right: 3rem;
}

.login-form__eye {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transition: background 0.15s, color 0.15s;
}

.login-form__eye:hover {
  background: #f3f4f6;
  color: #374151;
  transform: translateY(-50%);
  filter: none;
}

.login-form__eye svg {
  width: 1.2rem;
  height: 1.2rem;
}

.login-form__error {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: #fef2f2;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #fecaca;
}

.login-form__submit {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.9rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: #111827;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: none;
  transition: background 0.2s;
}

.login-form__submit:hover {
  background: #1f2937;
  transform: none;
  filter: none;
}

.login-form__submit:disabled {
  opacity: 0.6;
  cursor: wait;
}

/* ---- Responsive ---- */
@media (min-width: 768px) {
  .login-card__image {
    display: block;
  }

  .login-card__form {
    padding: 3rem;
  }
}

@media (max-width: 767px) {
  .login-card {
    border-radius: 1.25rem;
  }

  .login-card__form {
    padding: 2rem 1.5rem;
  }

  .login-card__header h1 {
    font-size: 1.5rem;
  }
}
</style>
