// generateHeatmap.js

const d3 = require('d3');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

function generateHeatmap(fileStats) {
  // Prepare data
  const data = Object.entries(fileStats).map(([filename, stats]) => ({
    filename,
    changes: stats.changes,
    contributors: stats.contributors,
  }));

  // Sort data based on changes
  data.sort((a, b) => b.changes - a.changes);

  // Set up SVG dimensions
  const width = 800;
  const height = data.length * 20 + 100; // Adjust height based on data length

  // Create a virtual DOM for D3 to use
  const dom = new JSDOM(`<html><body></body></html>`);
  const body = d3.select(dom.window.document).select('body');

  const svg = body
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Define scales
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.changes)])
    .range([0, width - 200]);

  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.filename))
    .range([50, height - 50])
    .padding(0.1);

  // Create bars
  svg
    .selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', 200)
    .attr('y', (d) => yScale(d.filename))
    .attr('width', (d) => xScale(d.changes))
    .attr('height', yScale.bandwidth())
    .attr('fill', 'steelblue');

  // Add file names
  svg
    .selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .attr('x', 195)
    .attr('y', (d) => yScale(d.filename) + yScale.bandwidth() / 2)
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .text((d) => d.filename)
    .attr('font-size', '10px');

  // Add changes labels
  svg
    .selectAll('.value')
    .data(data)
    .enter()
    .append('text')
    .attr('x', (d) => 200 + xScale(d.changes) + 5)
    .attr('y', (d) => yScale(d.filename) + yScale.bandwidth() / 2)
    .attr('dy', '.35em')
    .text((d) => d.changes)
    .attr('font-size', '10px');

  // Add title
  svg
    .append('text')
    .attr('x', width / 2)
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .text('Project Heatmap')
    .attr('font-size', '16px')
    .attr('font-weight', 'bold');

  return dom.window.document.querySelector('svg').outerHTML;
}

module.exports = generateHeatmap;