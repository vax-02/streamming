<template>
  <div class="grid lg:grid-cols-2 gap-8 mt-8 w-full">
    <!-- Horas de mayor actividad -->
    <section class="lg:col-span-2 bg-gray-900 border border-gray-700/50 rounded-2xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <ChartBarIcon class="w-6 h-6 text-blue-400" />
          Horas de mayor actividad
        </h3>
        <span class="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
          Hoy: {{ formatDate(new Date()) }}
        </span>
      </div>

      <!-- Gráfico de horas -->
        <div class="h-72 lg:h-80 relative">
        <canvas ref="hourlyChart"></canvas>
      </div>

      <!-- Estadísticas destacadas -->
      <div class="grid grid-cols-3 gap-4 mt-4">
        <div class="bg-gray-800/50 rounded-xl p-3 text-center">
          <p class="text-2xl font-bold text-blue-400">{{ peakHour }}</p>
          <p class="text-xs text-gray-400">Hora pico</p>
        </div>
        <div class="bg-gray-800/50 rounded-xl p-3 text-center">
          <p class="text-2xl font-bold text-green-400">{{ peakHourMessages }}</p>
          <p class="text-xs text-gray-400">Mensajes en hora pico</p>
        </div>
        <div class="bg-gray-800/50 rounded-xl p-3 text-center">
          <p class="text-2xl font-bold text-purple-400">{{ avgMessagesPerHour }}</p>
          <p class="text-xs text-gray-400">Promedio por hora</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'
import { ChartBarIcon, MapIcon } from '@heroicons/vue/24/solid'

// Registrar componentes de Chart.js
Chart.register(...registerables)

export default {
  name: 'DashboardPanel',
  components: {
    ChartBarIcon,
    MapIcon,
  },
  props: {
    hourlyData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chart: null,
    }
  },
  computed: {
    // Encontrar la hora con más mensajes
    peakHour() {
      if (!this.hourlyData.length) return '--'
      const max = Math.max(...this.hourlyData.map((h) => h.count))
      const peak = this.hourlyData.find((h) => h.count === max)
      return peak ? `${peak.hour}:00` : '--'
    },
    peakHourMessages() {
      if (!this.hourlyData.length) return '0'
      return Math.max(...this.hourlyData.map((h) => h.count))
    },
    avgMessagesPerHour() {
      if (!this.hourlyData.length) return '0'
      const total = this.hourlyData.reduce((sum, h) => sum + h.count, 0)
      return Math.round(total / this.hourlyData.length)
    },
  },
  watch: {
    hourlyData: {
      handler() {
        this.updateChart()
      },
      deep: true,
    },
  },
  mounted() {
    this.initChart()
    console.log('Datos recibidos en DashboardPanel:', this.hourlyData)
  },
  methods: {
    initChart() {
      const ctx = this.$refs.hourlyChart?.getContext('2d')
      if (!ctx) return

      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
      const data = this.hourlyData.length
        ? hours.map((h, i) => {
            const found = this.hourlyData.find((d) => d.hour === i)
            return found ? found.count : 0
          })
        : Array(24).fill(0)

      console.log('Datos para el gráfico de horas:', data)
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: hours,
          datasets: [
            {
              label: 'Mensajes por hora',
              data: data,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 1,
              borderRadius: 4,
              barPercentage: 0.7,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              backgroundColor: '#1f2937',
              titleColor: '#fff',
              bodyColor: '#9ca3af',
              borderColor: '#374151',
              borderWidth: 1,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#374151',
              },
              ticks: {
                color: '#9ca3af',
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#9ca3af',
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
        },
      })
    },

    updateChart() {
      if (!this.chart) {
        this.initChart()
        return
      }

      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
      const data = this.hourlyData.length
        ? hours.map((h, i) => {
            const found = this.hourlyData.find((d) => d.hour === i)
            return found ? found.count : 0
          })
        : Array(24).fill(0)

      this.chart.data.datasets[0].data = data
      this.chart.update()
    },

    formatDate(date) {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
      })
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
}
</script>
