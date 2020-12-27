// https://observablehq.com/@ashsicle/new-york-city-waste-flow@495
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["nyc-annual-waste_2017.csv",new URL("./files/ec57633c75cc70f4f2d39934e35f82d84684a28a0f083739f6d8df0276751f7fde9769721ca6a936eb38ea4725ec17376b6f891996a29eb0c2400c97fb7cd77c",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Öğrencilerin  Cinsiyet ve İnternet Kullanım Oranına Göre Sosyal Medyada  Sexting'e Maruz Kalma Sıklığı 
Renkler sosyal medya hesaplarını(Mavi: Facebook, Mor:İnstagram) temsil etmektedir.
Alt başlığımız olan: Ortaöğretim öğrencilerinin sosyal medyada cinsel içerikli mesjlara maruz kalma durumunun cinsiyet ve internet kullanım  değişkenleri arasında anlamlı bir ilişki vardır.`
)});
  main.variable(observer("chart")).define("chart", ["d3","width","height","sankey","graph","data","color"], function(d3,width,height,sankey,graph,data,color)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])

  const {nodes, links} = sankey({
    nodes: graph.nodes.map(d => Object.assign({}, d)),
    links: graph.links.map(d => Object.assign({}, d))
  });
  
  const total = d3.sum(data, d => d.value);
  
  let div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("display", "none")
      .style('z-index', '10')
      .text("new tooltip");

  svg.append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .on("mouseover", function (e, i) {
          div.html(d => i.name + "<br>" + Math.round(i.value/total*100) + "% (" + i.value.toLocaleString() + " <span style='text-transform: lowercase'>tons</span>)")
             .style("display", "block");
      })
      .on("mousemove", function (e) {
          div.style("top", e.pageY - 48 + "px")
             .style("left", e.pageX + "px");
      })
      .on('mouseout', function () {
          div.style("display", "none");
      })
    .append("title")
      .text(d => d.name + "\n" + Math.round(d.value/total*100) + "% (" + d.value.toLocaleString() + " tons)");
  
  svg.append("g")
      .attr("fill", "none")
    .selectAll("g")
    .data(links)
    .join("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", d => color(d.names[1]))
      .attr("stroke-width", d => d.width)
      .style("mix-blend-mode", "multiply")
      .on("mouseover", function (e, i) {
          d3.select(this).transition()
            .duration("50")
            .attr("opacity", "0.7");
          div.html(d => i.names.join(" → ") + "<br>" + Math.round(i.value/total*100) + "% (" + i.value.toLocaleString() + " <span style='text-transform: lowercase'>tons</span>)")
             .style("display", "block");
      })
      .on("mousemove", function (e) {
          div.style("top", e.pageY - 48 + "px")
             .style("left", e.pageX + "px");
      })
      .on('mouseout', function () {
          d3.select(this).transition()
             .duration('50')
             .attr('opacity', '1');
          div.style("display", "none");
      })
    .append("title")
      .text(d => d.names.join(" → ") + "\n" + Math.round(d.value/total*100) + "% (" + d.value.toLocaleString() + " tons)");    

  svg.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2 - 6)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => Math.round(d.value/total*100) + `% ` + d.name)
      .attr("class", "t1")
    .append("tspan")
      .attr("fill-opacity", 0.7)
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2 + 12)
      .text(d => `${d.value.toLocaleString()} tons`)
      .attr("class", "t2");
  
  return svg.node();
}
);
  main.variable(observer("width")).define("width", function(){return(
975
)});
  main.variable(observer("height")).define("height", function(){return(
650
)});
  main.variable(observer("sankey")).define("sankey", ["d3","width","height"], function(d3,width,height){return(
d3.sankey()
    .nodeSort(null)
    .linkSort(null)
    .nodeWidth(4)
    .nodePadding(20)
    .extent([[0, 5], [width, height - 5]])
)});
  main.variable(observer("graph")).define("graph", ["keys","data"], function(keys,data)
{
  let index = -1;
  const nodes = [];
  const nodeByKey = new Map;
  const indexByKey = new Map;
  const links = [];

  for (const k of keys) {
    for (const d of data) {
      const key = JSON.stringify([k, d[k]]);
      if (nodeByKey.has(key)) continue;
      const node = {name: d[k]};
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new Map;
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      const key = JSON.stringify(names);
      const value = d.value || 1;
      let link = linkByKey.get(key);
      if (link) { link.value += value; continue; }
      link = {
        source: indexByKey.get(JSON.stringify([a, d[a]])),
        target: indexByKey.get(JSON.stringify([b, d[b]])),
        names,
        value
      };
      links.push(link);
      linkByKey.set(key, link);
    }
  }

  return {nodes, links};
}
);
  main.variable(observer("style")).define("style", ["html"], function(html){return(
html`
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Barlow:200,300,400,500">
<style>
  .t1 {
      font-family: 'Barlow', sans-serif;
      font-size: 0.8em;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 2px;
  }
  .t2 {
      font-family: 'Barlow', sans-serif;
      font-size: 0.8em;
      font-weight: 400;
      text-transform: lowercase;
      letter-spacing: 1px;
  }
  .tooltip {
     position: absolute;
     text-align: center;
     padding: 8px;
     background: #777;
     color: #fff;
     border-radius: 8px;
     pointer-events: none;
     font-family: 'Barlow', sans-serif;
     font-size: 0.6em;
     font-weight: 400;
     text-transform: uppercase;
     letter-spacing: 1px;
     // opacity: 0.7;
}
</style>`
)});
  main.variable(observer("color")).define("color", ["d3"], function(d3){return(
d3.scaleOrdinal(["Facebook", "İnstagram"], ["#5d7ecc","#a536b9"]).unknown("#ccc")
)});
  main.variable(observer("keys")).define("keys", ["data"], function(data){return(
data.columns.slice(0, -1)
)});
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("nyc-annual-waste_2017.csv").text(), d3.autoType)
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6", "d3-sankey@0.12")
)});
  return main;
}
