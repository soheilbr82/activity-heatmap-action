# Activity Heatmap Action
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-License%20Compliance%20Checker-green?style=flat-square)](https://github.com/marketplace/actions/automated-license-check)


A GitHub Action that analyzes a repository to generate a heatmap based on:

- **File Activity:** Frequency of changes to files.
- **Contributors:** Number of people modifying files.
- **Complexity:** Code complexity metrics (e.g., cyclomatic complexity).

## **Features:**

- **Configurable Activity Thresholds:** Users can set thresholds for what constitutes a “hot” area.
- **Tracking Over Time:** Ability to see how hotspots evolve.
- **Integration with Project Boards:** Highlight high-activity areas in project management tools.


## **Usage**

To use this action, include it in your workflow file.

## **Basic Example**

```yml
name: Generate Project Heatmap

on:
  push:
    branches:
      - main
  pull_request:

permissions:
  contents: read
  issues: write
  pull-requests: write


jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Project Heatmap Action
        uses: soheilbr82/activity-heatmap-action@v1
        with:
          threshold: '5'
          time_range: '14'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload Heatmap Artifact
        uses: actions/upload-artifact@v3
        with:
          name: heatmap
          path: heatmap.svg

      - name: Post Heatmap Comment
        if: ${{ github.event_name == 'pull_request' }}
        uses: actions/github-script@v6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const svgContent = process.env.HEATMAP_SVG;
            if (svgContent) {
              const issueNumber = context.issue.number;
              await github.rest.issues.createComment({
                ...context.repo,
                issue_number: issueNumber,
                body: `### Project Heatmap\n![Heatmap](data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')})`,
              });
            }
        env:
          HEATMAP_SVG: ${{ steps['Run Project Heatmap Action'].outputs.heatmap_svg }}


```


## **Inputs**

| Name         | Description                         | Required | Default |
|--------------|-------------------------------------|----------|---------|
| `threshold`  | Activity threshold for hotspots     | No       | `10`    |
| `time_range` | Time range for analysis in days     | No       | `30`    |


## **Outputs**


| Name          | Description                          |
|---------------|--------------------------------------|
| `heatmap_svg` | SVG content of the generated heatmap |

## **Environment Variables**


| Name           | Description                               |
|----------------|-------------------------------------------|
| `GITHUB_TOKEN` | GitHub token with appropriate permissions |

## **Setup and Configuration**

1.	Prerequisites: Ensure you have the GITHUB_TOKEN secret available in your workflow. This token is automatically provided by GitHub Actions.
2.	Permissions: The GITHUB_TOKEN must have permissions to read repository data and post comments on issues and pull requests.
3.	Action Version: Replace your-username/project-heatmap-action@v1 with the appropriate repository path and version tag.


## **Advanced Usage**

### **Customizing Threshold and Time Range**

Adjust the threshold and time_range inputs to suit your project’s needs.

```yml
- name: Run Project Heatmap Action
  uses: your-username/project-heatmap-action@v1
  with:
    threshold: '3'
    time_range: '7'
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

```


## **How It Works**

1.	Data Collection: The action fetches commit data from the repository within the specified time range.
2.	Data Analysis: Calculates metrics such as file activity (number of changes) and counts unique contributors for each file.
3.	Heatmap Generation: Generates an SVG heatmap using D3.js, visualizing the hotspots in your codebase.
4.	Displaying the Heatmap:
	-	Pull Requests: Posts the heatmap as a comment in the pull request.
	-	Artifacts: Outputs the SVG content and uploads the heatmap as an artifact for download.


## **Limitations**

- **Large Repositories:** May take longer to run or hit API rate limits with very large repositories.
- **Complexity Analysis:** Currently, complexity analysis is not implemented but is planned for future updates.
- **Image Size:** Very large heatmaps may not display properly in comments due to GitHub’s size limitations.


## **Contributing**

Contributions are welcome! Please open issues or pull requests for any bugs, feature requests, or improvements.


## **License**

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).


## **Acknowledgments**
- GitHub Actions Toolkit
- D3.js
- jsdom