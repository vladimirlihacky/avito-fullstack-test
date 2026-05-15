package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
	ActiveRuns = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "assistant_runs_active",
		Help: "Активные запуски ассистентов",
	})

	RunDuration = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Name:    "assistant_run_duration_seconds",
		Help:    "Время обработки запроса ассистентом",
		Buckets: []float64{0.1, 0.3, 0.5, 1, 2, 5},
	}, []string{"status"})

	RunAttempts = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "assistant_run_attempts_total",
		Help: "Общее количество попыток запуска ассистента",
	}, []string{"assistant_id"})
)

func init() {
	prometheus.MustRegister(
		ActiveRuns,
		RunDuration,
		RunAttempts,
	)
}
