import ReactApexChart from "react-apexcharts";

export default function GaugeTile({
  title,
  value,
  unit,
  color,
  min = 0,
  max = 100,
}) {
  const last = Number.isFinite(value) ? value : null;

  let percent = 0;
  if (last !== null) {
    percent = ((last - min) / (max - min)) * 100;
    percent = Math.max(0, Math.min(100, percent));
  }

  const options = {
    chart: {
      type: "radialBar",
      offsetY: -20,
      sparkline: {
        enabled: true,
      },
    },
    colors: [color || "#2563eb"],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: "97%",
          margin: 5,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            color: "#444",
            opacity: 1,
            blur: 2,
          },
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            offsetY: -2,
            fontSize: "22px",
            formatter: function () {
              if (last === null) return "--";
              return `${last.toFixed(1)} ${unit || ""}`;
            },
          },
        },
      },
    },
    grid: {
      padding: {
        top: -10,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91],
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider w-full text-left mb-2">
        {title}
      </h3>
      <div className="w-full flex justify-center mt-5">
        <ReactApexChart
          options={options}
          series={[percent]}
          type="radialBar"
          height={200}
        />
      </div>
    </div>
  );
}
