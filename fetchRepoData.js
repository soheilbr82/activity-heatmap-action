// fetchRepoData.js

async function fetchRepoData(octokit, owner, repo, since) {
    let commits = [];
    let page = 1;
  
    while (true) {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        since,
        per_page: 100,
        page,
      });
  
      if (data.length === 0) break;
      commits = commits.concat(data);
      page++;
    }
  
    return commits;
  }
  
  module.exports = fetchRepoData;