<template>
  <main>
    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div
        class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)"
      ></div>
      <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button
          @click.prevent="newSong(song)"
          type="button"
          class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
        >
          <i
            class="fas"
            :class="{ 'fa-play': !playing, 'fa-pause': playing }"
          ></i>
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <div class="text-3xl font-bold">{{ song.modified_name }}</div>
          <div>{{ song.genre }}</div>
          <div class="song-price">{{ $n(1, "currency") }}</div>
        </div>
      </div>
    </section>
    <section class="container mx-auto mt-6">
      <div
        class="bg-white rounded border border-gray-200 relative flex flex-col"
      >
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
          <!-- Comment Count -->
          <span class="card-title">
            {{
              $tc("song.comment_count", song.comment_count, {
                count: song.comment_count,
              })
            }}
          </span>
          <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
          <div
            class="text-white text-center font-bold p-4 mb-4"
            v-if="comment_show_alert"
            :class="comment_alert_variant"
          >
            {{ comment_alert_message }}
          </div>
          <vee-form
            :validation-schema="schema"
            @submit="post"
            :initial-values="initialData"
            v-if="userLoggedIn"
          >
            <vee-field
              as="textarea"
              name="comment"
              class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4"
              placeholder="Your comment here..."
            ></vee-field>
            <ErrorMessage name="comment" class="text-red-600" />
            <button
              type="submit"
              class="py-1.5 px-3 rounded text-white bg-green-600 block"
              :disabled="comment_in_submission"
            >
              Submit
            </button>
          </vee-form>
          <!-- Sort Comments -->
          <select
            v-model="sort"
            class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          >
            <option value="1">Latest</option>
            <option value="2">Oldest</option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->
    <ul class="container mx-auto" id="comments">
      <li
        class="p-6 bg-gray-50 border border-gray-200"
        v-for="comment in sortedComments"
        :key="comment.docID"
      >
        <!-- Comment Author -->
        <div class="mb-5">
          <div class="font-bold">{{ comment.name }}</div>
          <time>{{ getTimeAgo(comment.datePosted) }}</time>
        </div>

        <p>
          {{ comment.comment }}
        </p>
      </li>
    </ul>
  </main>
</template>
<script>
import { songsCollection, commentsCollection, auth } from "@/includes/firebase";
import { mapState, mapActions } from "pinia";
import useUserStore from "@/stores/user";
import usePlayerStore from "@/stores/player";

export default {
  name: "SongView",
  data() {
    return {
      song: {},
      comments: [],
      sort: "1",
      schema: {
        comment: "required|min:3",
      },
      initialData: {
        comment: "",
      },
      comment_in_submission: false,
      comment_show_alert: false,
      comment_alert_variant: "bg-blue-500",
      comment_alert_message: "Please wait! Your comment is being submitted.",
    };
  },
  computed: {
    ...mapState(useUserStore, ["userLoggedIn"]),
    ...mapState(usePlayerStore, ["playing"]),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        if (this.sort === "1") {
          return new Date(b.datePosted) - new Date(a.datePosted);
        }

        return new Date(a.datePosted) - new Date(b.datePosted);
      });
    },
  },
  methods: {
    ...mapActions(usePlayerStore, ["newSong"]),
    async post(values, { resetForm }) {
      this.comment_in_submission = true;
      this.comment_show_alert = true;
      this.comment_alert_variant = "bg-blue-500";
      this.comment_alert_message =
        "Please wait! Your comment is being submitted.";

      const comment = {
        comment: values.comment,
        datePosted: new Date().toString(),
        sid: this.$route.params.id,
        name: auth.currentUser.displayName,
        uid: auth.currentUser.uid,
      };

      try {
        await commentsCollection.add(comment);
        this.comment_in_submission = false;
        this.comment_show_alert = true;
        this.comment_alert_variant = "bg-green-500";
        this.comment_alert_message =
          "Your comment has been submitted successfully.";

        resetForm();

        await this.getComments();

        await songsCollection.doc(this.$route.params.id).update({
          comment_count: this.song.comment_count + 1,
        });

        await this.getSong();
      } catch (e) {
        this.comment_in_submission = false;
        this.comment_show_alert = true;
        this.comment_alert_variant = "bg-red-500";
        this.comment_alert_message =
          "Something went wrong. Please try again." + e.message;
      }
    },

    getTimeAgo(dateTimeString) {
      const dateTime = Date.parse(dateTimeString);
      const now = new Date().getTime();
      const diff = now - dateTime;
      const diffMinutes = Math.round(diff / (1000 * 60));
      if (diffMinutes === 0) {
        return "just now";
      } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
      } else {
        return dateTimeString;
      }
    },
    async getComments() {
      const songId = this.$route.params.id;
      const snapComments = await commentsCollection
        .where("sid", "==", songId)
        .get();

      this.comments = [];

      snapComments.forEach((doc) => {
        this.comments.push({
          docID: doc.id,
          ...doc.data(),
        });
      });
    },
    async getSong() {
      const songId = this.$route.params.id;
      const song = await songsCollection.doc(songId).get();
      if (!song.exists) {
        this.$router.push({ name: "home" });
        return;
      }
      this.song = song.data();
    },
  },
  async beforeRouteEnter(to, from, next) {
    const docSnapshot = await songsCollection.doc(to.params.id).get();

    next((vm) => {
      if (!docSnapshot.exists) {
        vm.$router.push({ name: "home" });
        return;
      }

      vm.sort = vm.sort === "1" || vm.sort === "2" ? vm.sort : "1";

      vm.song = docSnapshot.data();
      vm.getComments();
    });
  },
  watch: {
    sort(newValue) {
      if (newValue === this.$route.query.sort) {
        return;
      }
      this.$router.push({
        query: {
          sort: newValue,
        },
      });
    },
  },
};
</script>
