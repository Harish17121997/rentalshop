<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { formatCurrency } from '@/utils/currency'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  received: { type: Number, required: true },
  pending: { type: Number, required: true },
})

const chartData = computed(() => ({
  labels: ['Collected', 'Pending'],
  datasets: [
    {
      data: [props.received, props.pending],
      backgroundColor: ['#0ca30c', '#fab219'],
      borderColor: '#fcfcfb',
      borderWidth: 2,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 10, boxHeight: 10, color: '#52514e', font: { size: 12 } },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}`,
      },
    },
  },
}
</script>

<template>
  <div class="chart-wrapper">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.chart-wrapper {
  height: 220px;
}
</style>
