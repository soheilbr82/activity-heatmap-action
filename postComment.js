// postComment.js

async function postComment(octokit, owner, repo, issue_number, svgContent) {
    const svgBase64 = Buffer.from(svgContent).toString('base64');
    const imageDataUri = `data:image/svg+xml;base64,${svgBase64}`;
    const commentBody = `### Project Heatmap\n![Heatmap](${imageDataUri})`;
  
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body: commentBody,
    });
  }
  
  module.exports = postComment;