import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  unit: string;
  color?: string;
}

export const ProgressChart = ({
  data,
  title,
  unit,
  color = "hsl(var(--primary))",
}: ProgressChartProps) => {
  const formatXAxis = (tickItem: string) => {
    return format(new Date(tickItem), "MMM dd");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="gradient-card p-3 rounded-lg shadow-card border">
          <p className="text-sm text-muted-foreground">{format(new Date(label), "PPP")}</p>
          <p className="text-lg font-semibold text-primary">
            {payload[0].value} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          Add some measurements to see your progress chart
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card shadow-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Tracking {data.length} measurement{data.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
