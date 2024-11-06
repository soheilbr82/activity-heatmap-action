// index.js

const core = require('@actions/core');
const github = require('@actions/github');
const fetchRepoData = require('./fetchRepoData');
const analyzeData = require('./analyzeData');
const generateHeatmap = require('./generateHeatmap');
const postComment = require('./postComment');

(async () => {
  try {
    // Retrieve inputs
    const token = core.getInput('GITHUB_TOKEN') || process.env.GITHUB_TOKEN;
    const threshold = parseInt(core.getInput('threshold'));
    const timeRange = parseInt(core.getInput('time_range'));

    // Initialize Octokit
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    // Calculate 'since' date based on timeRange input
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - timeRange);
    const since = sinceDate.toISOString();

    // Fetch data and analyze it
    const commits = await fetchRepoData(octokit, owner, repo, since);
    const fileStats = await analyzeData(octokit, owner, repo, commits);

    // Filter files based on threshold
    const filteredStats = {};
    for (const [filename, stats] of Object.entries(fileStats)) {
      if (stats.changes >= threshold) {
        filteredStats[filename] = stats;
      }
    }

    if (Object.keys(filteredStats).length === 0) {
      core.info('No files meet the threshold criteria.');
      return;
    }

    // Generate the heatmap SVG content
    const svgContent = generateHeatmap(filteredStats);

    // Set the output for the action
    core.setOutput('heatmap_svg', svgContent);

    // If the action is running in the context of a pull request, post the heatmap as a comment
    if (github.context.payload.pull_request) {
      const issue_number = github.context.payload.pull_request.number;
      await postComment(octokit, owner, repo, issue_number, svgContent);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();