const github_api_query = `
query($username: String!, $repoLimit: Int!, $commitLimit: Int!) {
  user(login: $username) {
    repositories(first: $repoLimit) {
      nodes {
        name
        stargazerCount
        commits: defaultBranchRef {
          target {
            ... on Commit {
              history(first: $commitLimit) {
                edges {
                  node {
                    message
                    oid
                    additions
                    deletions
                    url
                    author {
                      user {
                        login
                      }
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

async function fetch_github_data(variables) {
  const token = MY_AUTH_TOKEN;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query: github_api_query, variables })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.user.repositories.nodes;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Re-throw to be caught in fetchGitHubData
  }
}

