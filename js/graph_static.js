import links from "../data/links.json";
import nodes from "../data/nodes.json";

document.addEventListener("DOMContentLoaded", e => {
    const width = 1400;
    const height = 1000;

    nodes.forEach(n => {
        n.start = new Date(Date.parse(n.start));
    });

    const svg = d3.select("#graph").append("svg")
        .attr("viewBox", [0, 0, width, height]);

    const callout = d3.select("body").append("div")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    const defs = svg.append("svg:defs");
    const gray = defs.append("filter")
        .attr("id", "gray");
    gray.append("feColorMatrix")
        .attr("type", "matrix")
        .attr("values", "0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0");

    // TODO dynamic scale
    const linkWidthScale = d3.scaleOrdinal([0,1,2,3,4,5,6,7], [1,2,3,4,5,6,7,8]).unknown(13);

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", d => linkWidthScale(d.length))
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .on("mouseover", d => {
            if (window.graphActive) {
                avatars.attr("filter", a => (a.id === d.source.id || a.id === d.target.id) ? "" : "url(#gray)");
                link.style("stroke", l => (l === d) ? "black" : "#999")
                    .attr("stroke-width", l => ((l === d) ? 2 * linkWidthScale(l.length) : linkWidthScale(l.length)));
                callout.style("opacity", 1);
            }
        })
        .on("mouseout", d => {
            if (window.graphActive) {
                avatars.attr("filter", "");
                link.style("stroke", "#999")
                    .attr("stroke-width", d => (linkWidthScale(d.length)));
                callout.style("opacity", 0);
            }
        })        
        .on("mousemove", d => {
            if (window.graphActive) {
                callout.html(`Colleagues @ ${d.team}</br>during ${d.duration}</br>for ${(d.length != 0) ? d.length : "< 1"} ${(d.length > 1) ? "years" : "year"}`)
                .style("left", `${d3.event.pageX-50}px`)
                .style("top", `${d3.event.pageY+40}px`)
            }
        });;

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 30)
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .attr("fill", "transparent")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5);

    const avatars = svg.append("g")
        .selectAll("image")
        .data(nodes)
        .join("image")
        .attr("xlink:href", d => `https://d12jlmu17d0suy.cloudfront.net/nba-gm-graph/${d.pfp}`)
        .attr("transform", d => `translate(${d.x-30}, ${d.y-30})`)
        .attr("height", 60)
        .attr("width", 60)
        .attr("border-radius", "50%")
        .on("mouseover", d => {
            // console.log(window.graphActive)
            if (window.graphActive) {
                avatars.attr("filter", a => {
                    if (a === d) {
                        return "";
                    } else if (links.filter(l => (l.source.id == a.id && l.target.id == d.id)).length > 0) {
                        return "";
                    } else if (links.filter(l => (l.source.id == d.id && l.target.id == a.id)).length > 0) {
                        return "";
                    } else {
                        return "url(#gray)";
                    }
                });
                link.style("stroke", l => (l.source.id === d.id || l.target.id === d.id) ? "black" : "#999")
                    .attr("stroke-width", l => ((l.source.id === d.id || l.target.id === d.id) ? 2 * linkWidthScale(l.length) : linkWidthScale(l.length)));
                callout.style("opacity", 1);
            }
        })
        .on("mouseout", d => {
            if (window.graphActive) {
                avatars.attr("filter", "");
                link.style("stroke", "#999")
                    .attr("stroke-width", d => (linkWidthScale(d.length)));
                callout.style("opacity", 0);
            }
        })
        .on("mousemove", d => {
            if (window.graphActive) {
                callout.html(`${d.id}</br>GM of ${d.team}</br>since ${d.start.getFullYear()}`)
                .style("left", `${d3.event.pageX-50}px`) //`${d3.event.pageX}px` "100px"
                .style("top", `${d3.event.pageY+40}px`)
            }
        });
});