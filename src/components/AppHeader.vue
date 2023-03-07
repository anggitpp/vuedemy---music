<template>
  <header id="header" class="bg-gray-700">
    <nav class="container mx-auto flex justify-start items-center py-5 px-4">
      <!-- App Name -->
      <router-link
          exact-active-class="no-active"
          :to="{ name: 'home' }"
          class="text-white font-bold uppercase text-2xl mr-4"
      >Music
      </router-link>

      <div class="flex flex-grow items-center">
        <!-- Primary Navigation -->
        <ul class="flex flex-row mt-1">
          <!-- Navigation Links -->
          <li>
            <router-link :to="{ name: 'about' }" class="px-2 text-white"
            >About
            </router-link>
          </li>
          <li v-if="!userStore.userLoggedIn">
            <a class="px-2 text-white" href="#" @click.prevent="toggleAuthModal"
            >Login / Register</a
            >
          </li>
          <template v-else>
            <li>
              <router-link class="px-2 text-white" :to="{ name: 'manage' }"
              >Manage
              </router-link>
            </li>
            <li>
              <a class="px-2 text-white" href="#" @click.prevent="logoutFunc"
              >Logout</a
              >
            </li>
          </template>
        </ul>
        <ul class="ml-auto">
          <li>
            <a class="px-2 text-white" href="#" @click.prevent="changeLocale">
              {{ currentLocale }}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script>
import {mapStores} from "pinia";
import {mapActions} from "pinia";
import useModalStore from "@/stores/modal";
import useUserStore from "@/stores/user";

export default {
  name: "AppHeader",
  computed: {
    ...mapStores(useModalStore, useUserStore),
    currentLocale() {
      return this.$i18n.locale === "en" ? "English" : "Indonesia";
    },
  },
  methods: {
    ...mapActions(useUserStore, ["logout"]),
    toggleAuthModal() {
      this.modalStore.isOpen = !this.modalStore.isOpen;
    },
    async logoutFunc() {
      try {
        await this.logout();

        if (this.$route.meta.requiresAuth) {
          this.$router.push({name: "home"});
        }
      } catch (e) {
        alert("error" + e.message);
      }
    },
    changeLocale() {
      this.$i18n.locale =
          this.$i18n.locale === "en" ? "id" : "en";
    },
  },
};
</script>
