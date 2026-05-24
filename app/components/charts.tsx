"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ChartArea } from "lucide-react"


const chartConfig = {
  views: {
    label: "Traffic",
    color: "#a1cae6",
  },
} satisfies ChartConfig;

export function Charts({
  title,
  description,
  data,
}: {
  title?: string
  description?: string
  data?: {_id: string, peakTraffic: number, peakHour: number}[]
  icon?: React.ReactNode
  colorScheme?: string
}) {

const processedData = React.useMemo(() => {
  if (!data || data.length === 0) return []
  return data.map(item => ({
    name: item._id,           
    views: item.peakTraffic, 
    peakHour: item.peakHour, 
  }))
}, [data])

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
       <div className="flex flex-1 items-center gap-4 px-4 py-3 sm:pb-2 border-b">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-300">
            <ChartArea size={16}/>
        </div>
        <div className="flex flex-col">
            <CardTitle className="text-[14px] font-medium">{title}</CardTitle>
            <CardDescription className="text-[13px]">{description}</CardDescription>
        </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
          <LineChart
            accessibilityLayer
            data={processedData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey="name" // X AXIS
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                    })
                }
            />
            <ChartTooltip
                content={
                    <ChartTooltipContent
                    className="w-37.5 text-[10px]"
                    nameKey="views"
                    labelFormatter={(value, payload) => {
                        const peakHour = payload?.[0]?.payload?.peakHour
                        const date = new Date(value).toLocaleDateString("en-In", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        })
                        return `${date} at ${peakHour%12}:00 ${peakHour >= 12 ? "PM": "AM"}`  
                    }}
                    />
                }
            />
            <Line
              type="monotone"
              dataKey="views" // ( Y AXIS)
              stroke="#a1cae6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}