const { createApp, ref, onMounted } = Vue;

createApp({
  setup() {
    const dogs = ref([]);

    async function loadDogs() {
      try {
        const res = await fetch('/api/dogs');
        const data = await res.json();

        const updatedDogs = await Promise.all(
          data.map(async dog => {
            const imgRes = await fetch('https://dog.ceo/api/breeds/image/random');
            const imgData = await imgRes.json();
            return { ...dog, photo: imgData.message };
          })
        );

        dogs.value = updatedDogs;
      } catch (err) {
        console.error('Failed to load dogs:', err.message);
      }
    }

    onMounted(() => {
      loadDogs();
    });

    return { dogs };
  }
}).mount('#app');
