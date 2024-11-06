// analyzeData.js

async function analyzeData(octokit, owner, repo, commits) {
    const fileStats = {};
  
    for (const commit of commits) {
      const commitData = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
      });
  
      const author = commitData.data.author ? commitData.data.author.login : 'Unknown';
  
      for (const file of commitData.data.files) {
        const filename = file.filename;
        if (!fileStats[filename]) {
          fileStats[filename] = { changes: 0, contributors: new Set(), complexity: 0 };
        }
        fileStats[filename].changes += file.changes;
        fileStats[filename].contributors.add(author);
        // Complexity analysis can be added here
      }
    }
  
    // Convert contributors set to size
    for (const file in fileStats) {
      fileStats[file].contributors = fileStats[file].contributors.size;
    }
  
    return fileStats;
  }
  
  module.exports = analyzeData;