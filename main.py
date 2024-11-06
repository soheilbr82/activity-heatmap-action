# main.py

import os
import sys
import datetime
from github import Github
import matplotlib.pyplot as plt

def get_since_date(days):
    return (datetime.datetime.utcnow() - datetime.timedelta(days=int(days))).isoformat() + 'Z'

def fetch_repo_data(token, owner, repo_name, since):
    g = Github(token)
    repo = g.get_repo(f"{owner}/{repo_name}")
    commits = repo.get_commits(since=since)

    file_stats = {}

    for commit in commits:
        files = commit.files
        author = commit.author.login if commit.author else 'Unknown'

        for file in files:
            filename = file.filename
            if filename not in file_stats:
                file_stats[filename] = {'changes': 0, 'contributors': set()}
            file_stats[filename]['changes'] += file.changes
            file_stats[filename]['contributors'].add(author)

    return file_stats

def generate_heatmap(file_stats):
    # Sort files by number of changes
    sorted_files = sorted(file_stats.items(), key=lambda x: x[1]['changes'], reverse=True)

    filenames = [item[0] for item in sorted_files]
    changes = [item[1]['changes'] for item in sorted_files]

    plt.figure(figsize=(10, max(6, len(filenames) * 0.4)))
    plt.barh(filenames, changes, color='red')
    plt.xlabel('Number of Changes')
    plt.title('File Activity Heatmap')
    plt.gca().invert_yaxis()  # Invert y-axis to have the highest values at the top
    plt.tight_layout()
    plt.savefig('heatmap.png')

def main():
    threshold = os.getenv('INPUT_THRESHOLD', '10')
    time_range = os.getenv('INPUT_TIME_RANGE', '30')
    token = os.getenv('GITHUB_TOKEN')

    if not token:
        print('::error::GITHUB_TOKEN is not set')
        sys.exit(1)

    repo_full = os.getenv('GITHUB_REPOSITORY')
    if not repo_full:
        print('::error::GITHUB_REPOSITORY is not set')
        sys.exit(1)

    owner, repo_name = repo_full.split('/')

    since = get_since_date(time_range)
    file_stats = fetch_repo_data(token, owner, repo_name, since)

    # Filter based on threshold
    filtered_stats = {k: v for k, v in file_stats.items() if v['changes'] >= int(threshold)}

    if not filtered_stats:
        print('::notice::No files meet the threshold criteria.')
        sys.exit(0)

    generate_heatmap(filtered_stats)

    # Output the heatmap path
    print(f"::set-output name=heatmap_url::heatmap.png")

if __name__ == '__main__':
    main()