<script setup lang="ts">
import { supabase } from "@/lib/supabase";

const subirArchivo = async (file: File) => {
  const nombre = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage.from("profesionales").upload(nombre, file);

  if (error) {
    console.error(error);
    return;
  }

  console.log(data);

  const { data: urlData } = supabase.storage.from("profesionales").getPublicUrl(nombre);

  console.log("URL:", urlData.publicUrl);
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;

  if (target.files?.[0]) {
    await subirArchivo(target.files[0]);
  }
};
</script>

<template>
  <input type="file" @change="handleFileChange" />
</template>
