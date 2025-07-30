"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type TaskDependencyGraphProps = {
  tasks: Task[]
}

export function TaskDependencyGraph({ tasks }: TaskDependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      d3.select(svgRef.current).selectAll("*").remove()
      return
    }

    const width = containerRef.current?.clientWidth || 600
    const height = Math.max(tasks.length * 80, 400) // Adjust height based on number of tasks

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")

    svg.selectAll("*").remove() // Clear previous render

    const margin = { top: 20, right: 20, bottom: 20, left: 20 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Define arrow markers for dependencies
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 15) // Adjust to point at the node
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#999")
      .style("stroke", "none")

    // Create nodes from tasks
    const nodes = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      completed: task.completed,
    }))

    // For simplicity, let's assume a task depends on the previous task in the list
    // In a real application, you'd have explicit dependency data (e.g., task.dependencies: string[])
    const links = tasks
      .map((task, i) => {
        if (i > 0) {
          return { source: tasks[i - 1].id, target: task.id }
        }
        return null
      })
      .filter(Boolean) as { source: string; target: string }[]

    const simulation = d3
      .forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force("collide", d3.forceCollide(50)) // Prevent nodes from overlapping

    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")

    const node = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(
        d3
          .drag<SVGGElement, d3.SimulationNodeDatum>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended),
      )

    node
      .append("rect")
      .attr("width", 120)
      .attr("height", 60)
      .attr("x", -60)
      .attr("y", -30)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", (d) => {
        if ((d as any).completed) return "#10B981" // green-500
        if ((d as any).status === "In Progress") return "#3B82F6" // blue-500
        if ((d as any).status === "Blocked") return "#EF4444" // red-500
        return "#F59E0B" // amber-500 for Pending
      })
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "white")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .text((d) => (d as any).title)
      .call(wrapText, 100) // Wrap text if too long

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    function dragstarted(event: d3.D3DragEvent<SVGGElement, d3.SimulationNodeDatum, d3.SimulationNodeDatum>) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, d3.SimulationNodeDatum, d3.SimulationNodeDatum>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, d3.SimulationNodeDatum, d3.SimulationNodeDatum>) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    function wrapText(text: d3.Selection<SVGTextElement, unknown, SVGGElement, unknown>, width: number) {
      text.each(function (this: SVGTextElement) {
        const textElement = d3.select(this)
        const words = textElement.text().split(/\s+/).reverse()
        let word
        let line: string[] = []
        let lineNumber = 0
        const lineHeight = 1.1 // ems
        const y = textElement.attr("y")
        const dy = Number.parseFloat(textElement.attr("dy") || "0")
        let tspan = textElement
          .text(null)
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", dy + "em")

        while ((word = words.pop())) {
          line.push(word)
          tspan.text(line.join(" "))
          if ((tspan.node()?.getComputedTextLength() || 0) > width && line.length > 1) {
            line.pop()
            tspan.text(line.join(" "))
            line = [word]
            tspan = textElement
              .append("tspan")
              .attr("x", 0)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word)
          }
        }
        // Adjust vertical position for multi-line text
        const textHeight = (lineNumber + 1) * lineHeight * 10 // Assuming 10px font size
        textElement.attr("transform", `translate(0, ${-textHeight / 2 + 5})`) // Center vertically
      })
    }
  }, [tasks])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Task Dependency Graph</CardTitle>
        <CardDescription>Visual representation of task flow and dependencies.</CardDescription>
      </CardHeader>
      <CardContent ref={containerRef}>
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No tasks to display in the graph.
          </div>
        ) : (
          <svg ref={svgRef} className="border rounded-md"></svg>
        )}
      </CardContent>
    </Card>
  )
}
