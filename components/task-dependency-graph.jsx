"use client"

import {useEffect, useRef} from "react"
import * as d3 from "d3"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

export function TaskDependencyGraph({tasks}) {
    const svgRef = useRef(null)
    const containerRef = useRef(null)
    const tooltipRef = useRef(null)

    useEffect(() => {
        if (!tasks || tasks.length === 0) {
            d3.select(svgRef.current).selectAll("*").remove()
            return
        }

        const width = containerRef.current?.clientWidth || 600
        const height = Math.max(tasks.length * 80, 400)

        const svg = d3
            .select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")

        svg.selectAll("*").remove()

        const zoomG = svg.append("g")

        const zoom = d3
            .zoom()
            .scaleExtent([0.5, 2])
            .on("zoom", (event) => {
                zoomG.attr("transform", event.transform)
            })

        svg.call(zoom)

        const margin = {top: 20, right: 20, bottom: 20, left: 20}
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        const g = zoomG.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

        svg
            .append("defs")
            .append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "-0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", 0)
            .attr("orient", "auto")
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("xoverflow", "visible")
            .append("path")
            .attr("d", "M 0,-5 L 10 ,0 L 0,5")
            .attr("fill", "#999")
            .style("stroke", "none")

        const nodes = tasks.map((task) => ({...task}))
        const links = tasks
            .map((_, i) => (i > 0 ? {source: nodes[i - 1], target: nodes[i]} : null))
            .filter((l) => l !== null)

        const simulation = d3
            .forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
            .force("collide", d3.forceCollide(50))

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
            .data(nodes, (d) => d.id)
            .join("g")
            .call(
                d3
                    .drag()
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
                if (d.completed) return "#10B981"
                if (d.status === "In Progress") return "#3B82F6"
                if (d.status === "Blocked") return "#EF4444"
                return "#F59E0B"
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
            .text((d) => d.title)
            .call(wrapText, 100)

        node
            .on("mouseover", function (event, d) {
                d3.select(this).select("rect").attr("stroke", "#000").attr("stroke-width", 2)

                if (tooltipRef.current) {
                    tooltipRef.current.style.display = "block"
                    tooltipRef.current.style.left = `${event.pageX + 10}px`
                    tooltipRef.current.style.top = `${event.pageY + 10}px`
                    tooltipRef.current.innerHTML = `
                        <strong>${d.title}</strong><br/>
                        Status: ${d.status}<br/>
                        Priority: ${d.priority}<br/>
                        Due: ${new Date(d.dueDate).toLocaleDateString()}
                    `
                }
            })
            .on("mouseout", function () {
                d3.select(this).select("rect").attr("stroke", "#ccc").attr("stroke-width", 1)
                if (tooltipRef.current) tooltipRef.current.style.display = "none"
            })

        simulation.on("tick", () => {
            link
                .attr("x1", (d) => d.source.x)
                .attr("y1", (d) => d.source.y)
                .attr("x2", (d) => d.target.x)
                .attr("y2", (d) => d.target.y)

            node.attr("transform", (d) => `translate(${d.x},${d.y})`)
        })

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            event.subject.fx = event.subject.x
            event.subject.fy = event.subject.y
        }

        function dragged(event) {
            event.subject.fx = event.x
            event.subject.fy = event.y
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0)
            event.subject.fx = null
            event.subject.fy = null
        }

        function wrapText(text, width) {
            text.each(function () {
                const textElement = d3.select(this)
                const words = textElement.text().split(/\s+/).reverse()
                let word
                let line = []
                let lineNumber = 0
                const lineHeight = 1.1
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
                const textHeight = (lineNumber + 1) * lineHeight * 10
                textElement.attr("transform", `translate(0, ${-textHeight / 2 + 5})`)
            })
        }
    }, [tasks])

    return (
        <Card className="w-full relative">
            <CardHeader>
                <CardTitle>Task Dependency Graph</CardTitle>
                <CardDescription>Visual representation of task flow and dependencies.</CardDescription>
            </CardHeader>
            <CardContent ref={containerRef}>
                {tasks.length === 0 ? (
                    <div className="flex items-centre justify-centre h-64 text-muted-foreground">
                        No tasks to display in the graph.
                    </div>
                ) : (
                    <svg ref={svgRef} className="border rounded-md w-full h-full" role="img"/>
                )}
                <div
                    ref={tooltipRef}
                    className="absolute z-10 bg-white shadow-md border px-3 py-2 rounded text-sm"
                    style={{display: "none", pointerEvents: "none"}}
                ></div>
            </CardContent>
        </Card>
    )
}