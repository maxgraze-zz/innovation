<script lang="ts">
    export function capitalizeName(name: string) {
  return name.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
}

</script>