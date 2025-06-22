<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200 relative z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and main navigation -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <NuxtLink to="/" class="text-xl font-bold text-blue-600">
                📚 BookManager
              </NuxtLink>
            </div>
            
            <!-- Desktop navigation -->
            <div class="hidden md:ml-6 md:flex md:space-x-8">
              <NuxtLink
                to="/books"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-blue-500 text-blue-600"
              >
                Books
              </NuxtLink>
              <NuxtLink
                to="/books/create"
                class="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
                active-class="border-blue-500 text-blue-600"
              >
                Add Book
              </NuxtLink>
            </div>
          </div>

          <!-- User menu -->
          <div class="flex items-center">
            <div v-if="authStore.isAuthenticated" class="relative">
              <!-- User dropdown -->
              <div class="relative" ref="userMenuRef">
                <button
                  @click.stop="toggleUserMenu"
                  type="button"
                  class="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span class="sr-only">Open user menu</span>
                  <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-blue-600">
                      {{ authStore.user?.first_name?.charAt(0) || 'U' }}
                    </span>
                  </div>
                  <svg class="ml-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>

                <!-- Dropdown menu -->
                <transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-show="userMenuOpen"
                    class="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    @click.stop
                  >
                    <div class="px-4 py-2 border-b border-gray-100">
                      <p class="text-sm text-gray-900 truncate">{{ authStore.user?.email }}</p>
                      <p class="text-xs text-gray-500 capitalize">{{ authStore.user?.role || 'User' }}</p>
                    </div>
                    <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Login button for guests -->
            <div v-else class="flex space-x-4">
              <NuxtLink
                to="/auth/login"
                class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign in
              </NuxtLink>
              <NuxtLink
                to="/auth/register"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign up
              </NuxtLink>
            </div>

            <!-- Mobile menu button -->
            <div class="md:hidden ml-4">
              <button
                @click="toggleMobileMenu"
                type="button"
                class="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span class="sr-only">Open main menu</span>
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile menu -->
        <div v-show="mobileMenuOpen" class="md:hidden" id="mobile-menu">
          <div class="pt-2 pb-3 space-y-1">
            <NuxtLink
              to="/books"
              class="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              active-class="text-blue-600 bg-blue-50"
              @click="closeMobileMenu"
            >
              Books
            </NuxtLink>
            <NuxtLink
              to="/books/create"
              class="text-gray-500 hover:text-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              active-class="text-blue-600 bg-blue-50"
              @click="closeMobileMenu"
            >
              Add Book
            </NuxtLink>
          </div>
          
          <div v-if="authStore.isAuthenticated" class="pt-4 pb-3 border-t border-gray-200">
            <div class="flex items-center px-4">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-sm font-medium text-blue-600">
                    {{ authStore.user?.first_name?.charAt(0) || 'U' }}
                  </span>
                </div>
              </div>
              <div class="ml-3">
                <div class="text-base font-medium text-gray-800">{{ authStore.fullName }}</div>
                <div class="text-sm font-medium text-gray-500">{{ authStore.user?.email }}</div>
              </div>
            </div>
            <div class="mt-3 space-y-1">
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const authStore = useAuthStore()

// Local state for menus
const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)
const userMenuRef = ref(null)

// Toggle functions
const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// Handle logout
const handleLogout = async () => {
  userMenuOpen.value = false
  mobileMenuOpen.value = false
  await authStore.logout()
}

// Close menus when clicking outside
onMounted(() => {
  const handleClickOutside = (event) => {
    // Close user menu if clicking outside
    if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
      userMenuOpen.value = false
    }
    
    // Close mobile menu if clicking outside
    const mobileMenu = document.querySelector('#mobile-menu')
    const mobileMenuButton = document.querySelector('[aria-controls="mobile-menu"]')
    
    if (mobileMenuOpen.value && 
        mobileMenu && 
        !mobileMenu.contains(event.target) &&
        mobileMenuButton &&
        !mobileMenuButton.contains(event.target)) {
      mobileMenuOpen.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script> 