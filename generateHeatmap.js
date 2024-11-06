// generateHeatmap.js

const d3 = require('d3');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/**
 * Generates an SVG heatmap based on the provided file statistics.
 *
 * @param {Object} data - An object where keys are filenames and values are stats (e.g., changes).
 * @returns {string} - Serialized SVG content as a string.
 */
function generateHeatmap(data) {
  const width = 800;
  const height = 600;
  const margin = { top: 50, right: 50, bottom: 50, left: 200 };

  // Create a virtual DOM
  const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
  const body = d3.select(dom.window.document).select('body');

  const svg = body
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Prepare data
  const files = Object.keys(data);
  const changes = files.map(d => data[d].changes);

  // Define scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(changes)])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleBand()
    .domain(files)
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  // Create bars
  svg.selectAll('.bar')
    .data(files)
    .enter()
    .append('rect')
    .attr('x', xScale(0))
    .attr('y', d => yScale(d))
    .attr('width', d => xScale(data[d].changes) - xScale(0))
    .attr('height', yScale.bandwidth())
    .attr('fill', 'steelblue');

  // Add file names
  svg.selectAll('.label')
    .data(files)
    .enter()
    .append('text')
    .attr('x', margin.left - 10)
    .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .text(d => d)
    .attr('font-size', '10px');

  // Add changes labels
  svg.selectAll('.value')
    .data(files)
    .enter()
    .append('text')
    .attr('x', d => xScale(data[d].changes) + 5)
    .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
    .attr('dy', '.35em')
    .text(d => data[d].changes)
    .attr('font-size', '10px');

  // Add title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .text('Project Heatmap')
    .attr('font-size', '16px')
    .attr('font-weight', 'bold');

  // Serialize SVG
  return body.select('svg').node().outerHTML;
}

module.exports = generateHeatmap;