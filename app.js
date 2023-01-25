/**
 * Accurate calculator
 * @param {String} a first number
 * @param {String} op Operator
 * @param {String} b Second number
 * @returns String number
 */
const cal = (a, op, b) => {
  /**
   * 
   * @param {Number} len Number of decimal place
   * @returns String zeros amount of given decimal place
   */
  const zeros = (len) => {
    let str = "";
    for (let i = 0; i < len; i++) {
      str += "0";
    }
    return str;
  }

  const x = a.split(".");
  const xl = x[1] === undefined ? 0 : x[1].length;
  const y = b.split(".");
  const yl = y[1] === undefined ? 0 : y[1].length;
  const ori = 10 ** Math.max(xl, yl);
  const compare = xl - yl;
  const n1 = parseInt(x.join("") + zeros(compare >= 0 ? 0 : Math.abs(compare)));
  const n2 = parseInt(y.join("") + zeros(compare <= 0 ? 0 : compare));
  switch (op) {
    case "+":
      return ((n1 + n2) / ori).toString();
    case "-":
      return ((n1 - n2) / ori).toString();
    case "*":
      return ((n1 * n2) / (ori ** 2)).toString();
    case "/":
      return (n1 / n2).toString();
  }
}

$(document).ready(() => {
  const req = new XMLHttpRequest();
  req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json", true);
  req.send();
  req.onload = () => {
    //Parsing string data into object
    const json = JSON.parse(req.responseText);
    //Store data value within json
    const dataset = json.data;


    //Window resizing handler
    //(I wanted to make this graph responsible with vw and vh. So, I made a responsible graph in this way, but I couldn't make axis responsible)
    function reScale () {
      //Initialize svg
      d3.select("svg").remove();
      
      //make new svg
      const svg = d3.select("main").append("svg").attr("width", "70vw").attr("height", "70vh");
      
      //These ara string width and height
      const width = $("svg").css("width").match(/[0-9]+.[0-9]+/)[0];
      const height = $("svg").css("height").match(/[0-9]+.[0-9]+/)[0];

      //For making space for axis, I made padding
      const wPadding = cal(width, "*", "0.15");
      const hPadding = cal(height, "*", "0.1");

      //Set graphing size
      const graph = {
        x: cal(width, "-", cal(wPadding, "+", wPadding)),
        y: cal(height, "-", cal(hPadding, "+", hPadding))
      }

      //Handling ticks regarding window width
      const tickNum = () => {
        const w = parseFloat(width);
        if (w > 600) {
          return 16;
        } else if (400 < w && w <= 600) {
          return 24;
        } else if (200 < w && w <= 400) {
          return 36;
        } else {
          return 60;
        }
      }

      //x and y value scaling
      const xScale = d3.scaleBand(dataset.map(d => d[0]), [0, parseFloat(graph.x)]);
      const yScale = d3.scaleLinear().domain([0, d3.max(dataset, (d) => d[1])]).range([parseFloat(graph.y), 0]);

      //Making bar's width evenly, I set norm
      const norm = cal(graph.x, "/", dataset.length.toString());
      
      //Render graph
      svg.selectAll("rect").data(dataset).enter().append("rect")
      .attr("width", parseFloat(norm))
      .attr("height", d => parseFloat(cal(graph.y, "-", yScale(d[1]).toString())))
      .attr("x", d => {
        return parseFloat(cal(wPadding, "+", xScale(d[0]).toString()))})
      .attr("y", d => parseFloat(cal(yScale(d[1]).toString(), "+", hPadding)))
      .attr("data-date", d => d[0]).attr("data-gdp", d => d[1])
      .attr("fill", "cornflowerblue").attr("class", "bar");

      //Make axises
      console.log(xScale.domain().filter((_,i) => (i % 16) === 0).map(i => i.match(/[0-9]+/)[0]));
      const xAxis = d3.axisBottom(xScale).tickFormat(x => x.split("-")[0]).tickValues(xScale.domain().filter((_,i) => (i % 16) === 0));
      const yAxis = d3.axisLeft(yScale);
      svg.append("g").attr("transform", `translate(${wPadding}, ${cal(height, "-", hPadding)})`).attr('id', "x-axis").call(xAxis);
      svg.append("g").attr("transform", `translate(${wPadding}, ${hPadding})`).attr("id", "y-axis").call(yAxis);

      //Axis title
      svg.append("text").attr("text-anchor", "end").attr('x', `${cal(width, "-", wPadding)}`).attr("y", `${cal(height, "-", cal(hPadding, "*", "0.1"))}`).style("font-size", "0.8em").text("Date (Quater month)");
      svg.append("text").attr("text-anchor", "end").attr("transform-origin", `${cal(wPadding, "*", "1.25")} ${hPadding}`).attr("transform", "rotate(-90)").attr('x', `${cal(wPadding, "*", "1.25")}`).attr("y", `${hPadding}`).style("font-size", "0.8em").text("GDP (Bilion dollar)");

      //Tool tip setting
      const toolTip = d3.select("main").append("div").attr("id", "tooltip")
      $("rect").hover((event) => {
        const pointData = [event.target.attributes["data-date"].value, event.target.attributes["data-gdp"].value];
        $(`[data-date=${pointData[0]}]`).attr("fill", "aqua")
        toolTip.style("top", `${height}px`).style("left", `${event.clientX + 10}px`).style("opacity", "100").attr("data-date", `${pointData[0]}`)
        .text(`Date: ${pointData[0]}
        Bilion: ${pointData[1]}`);
      }, (event) => {
        toolTip.style("opacity", "0")
        const tdate = event.target.attributes["data-date"].value;
        $(`[data-date=${tdate}]`).attr("fill", "cornflowerblue")
      })
    }

    //Initialize
    reScale();

    window.addEventListener("resize", reScale);
  }
})
